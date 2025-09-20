/**
 * Environment Variable Validation Utility
 * 
 * This utility helps manage environment-dependent features and provides
 * graceful fallbacks when APIs are not configured.
 */

export interface EnvConfig {
  clarifai: {
    apiKey: string | undefined;
    workflowId: string;
    enabled: boolean;
  };
  edamam: {
    appId: string | undefined;
    appKey: string | undefined;
    enabled: boolean;
  };
  openai: {
    apiKey: string | undefined;
    enabled: boolean;
  };
  brave: {
    apiKey: string | undefined;
    enabled: boolean;
  };
  supabase: {
    url: string | undefined;
    anonKey: string | undefined;
    serviceKey: string | undefined;
    enabled: boolean;
  };
}

export function getEnvConfig(): EnvConfig {
  return {
    clarifai: {
      apiKey: process.env.CLARIFAI_API_KEY?.trim(),
      workflowId: process.env.CLARIFAI_WORKFLOW_ID?.trim() || "General",
      enabled: !!process.env.CLARIFAI_API_KEY?.trim(),
    },
    edamam: {
      appId: process.env.EDAMAM_APP_ID?.trim(),
      appKey: process.env.EDAMAM_APP_KEY?.trim(),
      enabled: !!(process.env.EDAMAM_APP_ID?.trim() && process.env.EDAMAM_APP_KEY?.trim()),
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY?.trim(),
      enabled: !!process.env.OPENAI_API_KEY?.trim(),
    },
    brave: {
      apiKey: process.env.BRAVE_API_KEY?.trim(),
      enabled: !!process.env.BRAVE_API_KEY?.trim(),
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
      enabled: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() &&
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      ),
    },
  };
}

export function getFeatureFlags() {
  const config = getEnvConfig();
  
  return {
    // Core features
    foodRecognition: config.clarifai.enabled,
    nutritionAnalysis: config.edamam.enabled,
    aiAnalysis: config.openai.enabled,
    webSearch: config.brave.enabled,
    database: config.supabase.enabled,
    
    // Derived features
    cameraScanning: config.clarifai.enabled || config.supabase.enabled, // Can work with just database
    manualInput: config.supabase.enabled, // Always works if database is available
    barcodeScanning: config.supabase.enabled, // Database-dependent
    searchFunctionality: config.supabase.enabled, // Database-dependent
    
    // Advanced features
    personalizedRecommendations: config.supabase.enabled && config.openai.enabled,
    advancedNutritionAnalysis: config.edamam.enabled && config.openai.enabled,
    fallbackNutritionData: true, // Always available
  };
}

export function getMissingEnvVars(): string[] {
  const config = getEnvConfig();
  const missing: string[] = [];
  
  if (!config.clarifai.enabled) missing.push("CLARIFAI_API_KEY");
  if (!config.edamam.enabled) {
    if (!config.edamam.appId) missing.push("EDAMAM_APP_ID");
    if (!config.edamam.appKey) missing.push("EDAMAM_APP_KEY");
  }
  if (!config.openai.enabled) missing.push("OPENAI_API_KEY");
  if (!config.brave.enabled) missing.push("BRAVE_API_KEY");
  if (!config.supabase.enabled) {
    if (!config.supabase.url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!config.supabase.anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!config.supabase.serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  
  return missing;
}

export function getEnvStatus() {
  const config = getEnvConfig();
  const features = getFeatureFlags();
  const missing = getMissingEnvVars();
  
  return {
    config,
    features,
    missing,
    isFullyConfigured: missing.length === 0,
    canRunBasicFeatures: features.database && features.manualInput,
    canRunAdvancedFeatures: features.foodRecognition && features.nutritionAnalysis,
  };
}

// Client-side environment check (for browser)
export function getClientEnvStatus() {
  if (typeof window === 'undefined') {
    return { error: 'This function can only be called on the client side' };
  }
  
  // Check if we can make API calls to determine environment status
  return {
    supabaseConfigured: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    // Note: Other API keys are server-side only
  };
}
