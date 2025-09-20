export async function GET() {
  try {
    const envCheck = {
      clarifai: {
        apiKey: !!process.env.CLARIFAI_API_KEY,
        workflowId: !!process.env.CLARIFAI_WORKFLOW_ID || true, // Optional, defaults to "General"
        status: !!(process.env.CLARIFAI_API_KEY)
      },
      edamam: {
        appId: !!process.env.EDAMAM_APP_ID,
        appKey: !!process.env.EDAMAM_APP_KEY,
        status: !!(process.env.EDAMAM_APP_ID && process.env.EDAMAM_APP_KEY)
      },
      openai: {
        apiKey: !!process.env.OPENAI_API_KEY,
        status: !!process.env.OPENAI_API_KEY
      },
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        status: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      },
      brave: {
        apiKey: !!process.env.BRAVE_API_KEY,
        status: !!process.env.BRAVE_API_KEY
      }
    }

    const allRequired = envCheck.clarifai.status && envCheck.edamam.status && envCheck.openai.status && envCheck.supabase.status
    const allOptional = envCheck.brave.status

    return Response.json({
      success: true,
      environment: envCheck,
      summary: {
        required: allRequired,
        optional: allOptional,
        overall: allRequired
      },
      message: allRequired 
        ? "✅ All required environment variables are configured!" 
        : "❌ Some required environment variables are missing. Check the details below.",
      details: {
        missing: {
          clarifai: !envCheck.clarifai.status ? "CLARIFAI_API_KEY" : null,
          edamam: !envCheck.edamam.status ? (!envCheck.edamam.appId ? "EDAMAM_APP_ID" : "EDAMAM_APP_KEY") : null,
          openai: !envCheck.openai.status ? "OPENAI_API_KEY" : null,
          supabase: !envCheck.supabase.status ? (!envCheck.supabase.url ? "NEXT_PUBLIC_SUPABASE_URL" : "NEXT_PUBLIC_SUPABASE_ANON_KEY") : null
        }
      }
    })

  } catch (error) {
    return Response.json({ 
      error: "Failed to check environment variables",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
