# Environment Variables Setup Guide

This guide will help you set up the **actually required** environment variables for the Foodle application.

## ✅ **ACTUALLY REQUIRED** Environment Variables

Create a `.env.local` file in the root directory of your project with the following variables:

```bash
# Supabase Configuration (ESSENTIAL - App won't work without these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional Supabase (for development redirects)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Clarifai AI Configuration (RECOMMENDED - for camera food recognition)
CLARIFAI_API_KEY=your_clarifai_api_key_here
CLARIFAI_WORKFLOW_ID=General

# Edamam Nutrition API Configuration (RECOMMENDED - for accurate nutrition data)
EDAMAM_APP_ID=your_edamam_app_id_here
EDAMAM_APP_KEY=your_edamam_app_key_here

# OpenAI API Configuration (OPTIONAL - for advanced AI analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Brave Search API (OPTIONAL - for additional nutrition data)
BRAVE_API_KEY=your_brave_api_key_here
```

## 🎯 **Feature Availability by Configuration**

### ✅ **Minimum Setup (Just Supabase)**:
- User authentication and profiles
- Manual food input
- Basic nutritional analysis with fallback data
- Food scan history
- Database storage

### ✅ **With Clarifai API**:
- AI-powered food recognition from photos
- Camera scanning functionality
- Automatic food identification

### ✅ **With Edamam API**:
- Accurate nutritional data
- Detailed macro and micronutrient information
- Food database lookup

### ✅ **With OpenAI API**:
- Advanced AI analysis (if implemented)
- Enhanced health insights

### ✅ **With Brave API**:
- Additional nutrition data (optional)

## How to Get API Keys

### 1. Supabase (Database & Authentication) - **REQUIRED**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the Project URL and anon key
5. For service role key, copy the service_role key (keep this secret!)

### 2. Clarifai AI (Food Recognition) - **RECOMMENDED**
1. Go to [clarifai.com](https://clarifai.com)
2. Sign up for a free account
3. Go to your account settings
4. Generate a new API key
5. The workflow ID "General" should work by default

### 3. Edamam Nutrition API (Nutritional Data) - **RECOMMENDED**
1. Go to [developer.edamam.com](https://developer.edamam.com)
2. Sign up for a free account
3. Create a new application for the "Nutrition Analysis API"
4. Copy the Application ID and Application Key

### 4. OpenAI API (Advanced Analysis) - **OPTIONAL**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up for an account
3. Go to API Keys section
4. Create a new API key
5. Add some credits to your account

### 5. Brave Search API (Additional Data) - **OPTIONAL**
1. Go to [brave.com/search/api](https://brave.com/search/api)
2. Sign up for an account
3. Get your API key
4. This is optional and only used for additional nutrition data

## Environment Variable Usage in Code

The application uses these environment variables in the following API routes:

### Supabase (`/lib/supabase/`) - **REQUIRED**
- `NEXT_PUBLIC_SUPABASE_URL` - Required for database connection
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Required for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY` - Required for server-side operations

### Clarifai Recognition (`/api/clarifai-recognition`) - **RECOMMENDED**
- `CLARIFAI_API_KEY` - Required for food recognition
- `CLARIFAI_WORKFLOW_ID` - Optional, defaults to "General"

### Edamam Nutrition (`/api/edamam-nutrition`) - **RECOMMENDED**
- `EDAMAM_APP_ID` - Required for nutrition data
- `EDAMAM_APP_KEY` - Required for nutrition data

### OpenAI Integration - **OPTIONAL**
- `OPENAI_API_KEY` - For AI-powered food analysis (if implemented)

### Brave Search (`/api/get-nutrition`) - **OPTIONAL**
- `BRAVE_API_KEY` - Optional, for additional nutrition data

## Testing Your Setup

1. Create the `.env.local` file with your API keys
2. Restart your development server (`npm run dev`)
3. Try scanning a food item
4. Check the browser console for any API key errors
5. Look for the debug logs with 🔍 and 🍎 emojis
6. Visit `/api/check-env` to see which APIs are configured

## Security Notes

- Never commit `.env.local` to version control
- The `.env.local` file is already in `.gitignore`
- Keep your API keys secure and don't share them
- Use different keys for development and production

## Troubleshooting

If you see errors like "API key not configured":
1. Check that your `.env.local` file exists in the root directory
2. Verify that the variable names match exactly (case-sensitive)
3. Make sure there are no extra spaces around the `=` sign
4. Restart your development server after making changes
5. Check that your API keys are valid and have sufficient credits
6. Visit `/api/check-env` to see detailed environment status

## Production Deployment

For production deployment (Vercel, Netlify, etc.):
1. Add the environment variables in your hosting platform's dashboard
2. Use the same variable names as in `.env.local`
3. Make sure to set `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your production domain
4. Test all API integrations after deployment
5. Use the built-in environment checker at `/api/check-env`

## ❌ **Variables NOT Required** (Removed from guides)

These variables were listed in previous guides but are **NOT actually used** in the codebase:

- `NEXTAUTH_SECRET` - App uses Supabase Auth, not NextAuth
- `NEXTAUTH_URL` - App uses Supabase Auth, not NextAuth
- `FIREBASE_PROJECT_ID` - Only used in unused migration route
- `FIREBASE_CLIENT_EMAIL` - Only used in unused migration route
- `FIREBASE_PRIVATE_KEY` - Only used in unused migration route