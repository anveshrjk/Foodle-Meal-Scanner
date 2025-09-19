// app/api/auth/firebase-to-supabase/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';

// --- Initialize Firebase Admin ---
// Make sure to set these environment variables in your .env.local file
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'), // Fix for Vercel
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// --- Initialize Supabase Admin Client ---
// Use the service_role key for admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    // 1. Verify the Firebase ID token using the Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // 2. Find or create the user in Supabase Auth
    let { data: { user }, error: findError } = await supabaseAdmin.auth.admin.getUserByEmail(email!);

    if (findError && findError.message === 'User not found') {
      // If user doesn't exist, create them
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true, // User is already verified by Google
        user_metadata: { name, avatar_url: picture },
      });
      if (createError) throw createError;
      user = newUser.user;
    } else if (findError) {
      throw findError;
    }

    if (!user) throw new Error("Could not find or create user in Supabase");

    // 3. Generate a session for the user in Supabase
    const { data, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email!,
    });

    if (sessionError) throw sessionError;

    // Return the session object to the client
    return NextResponse.json({ session: data.session }, { status: 200 });

  } catch (error) {
    console.error("Error in Firebase-to-Supabase auth:", error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}