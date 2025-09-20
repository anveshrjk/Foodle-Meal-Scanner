import { getEnvStatus } from "@/lib/env-validation"

export async function GET() {
  try {
    const envStatus = getEnvStatus()
    
    return Response.json({
      success: true,
      environment: {
        clarifai: {
          status: envStatus.config.clarifai.enabled,
          workflowId: envStatus.config.clarifai.workflowId,
          message: envStatus.config.clarifai.enabled ? "✅ Configured" : "❌ Missing CLARIFAI_API_KEY"
        },
        edamam: {
          status: envStatus.config.edamam.enabled,
          appId: !!envStatus.config.edamam.appId,
          appKey: !!envStatus.config.edamam.appKey,
          message: envStatus.config.edamam.enabled ? "✅ Configured" : "❌ Missing EDAMAM_APP_ID or EDAMAM_APP_KEY"
        },
        openai: {
          status: envStatus.config.openai.enabled,
          message: envStatus.config.openai.enabled ? "✅ Configured" : "❌ Missing OPENAI_API_KEY"
        },
        brave: {
          status: envStatus.config.brave.enabled,
          message: envStatus.config.brave.enabled ? "✅ Configured" : "❌ Missing BRAVE_API_KEY (Optional)"
        },
        supabase: {
          status: envStatus.config.supabase.enabled,
          url: !!envStatus.config.supabase.url,
          anonKey: !!envStatus.config.supabase.anonKey,
          serviceKey: !!envStatus.config.supabase.serviceKey,
          message: envStatus.config.supabase.enabled ? "✅ Configured" : "❌ Missing Supabase credentials"
        }
      },
      features: envStatus.features,
      summary: {
        required: envStatus.canRunBasicFeatures,
        optional: envStatus.config.brave.enabled,
        overall: envStatus.isFullyConfigured,
        canRunBasicFeatures: envStatus.canRunBasicFeatures,
        canRunAdvancedFeatures: envStatus.canRunAdvancedFeatures
      },
      message: envStatus.isFullyConfigured 
        ? "✅ All environment variables are configured!" 
        : envStatus.canRunBasicFeatures
        ? "⚠️ Basic features available. Some advanced features may be limited."
        : "❌ Critical environment variables missing. Please configure Supabase at minimum.",
      details: {
        missing: envStatus.missing,
        recommendations: {
          minimum: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
          recommended: ["CLARIFAI_API_KEY", "EDAMAM_APP_ID", "EDAMAM_APP_KEY"],
          optional: ["OPENAI_API_KEY", "BRAVE_API_KEY"]
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