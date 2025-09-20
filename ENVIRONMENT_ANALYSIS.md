# Environment Variables Analysis - What's Actually Required

Based on my analysis of the codebase, here's what environment variables are **actually required** vs what's listed in the guides:

## ✅ **ACTUALLY REQUIRED** (Core Functionality)

### Supabase (Essential - App won't work without these):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```
**Used in**: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, auth pages

### Optional Supabase (For Development):
```bash
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```
**Used in**: `app/auth/login/page.tsx`, `app/auth/signup/page.tsx` (has fallback)

## ✅ **RECOMMENDED** (Enhanced Features)

### Clarifai AI (Food Recognition):
```bash
CLARIFAI_API_KEY=your_clarifai_api_key_here
CLARIFAI_WORKFLOW_ID=General  # Optional, defaults to "General"
```
**Used in**: `app/api/clarifai-recognition/route.ts`, `lib/env-validation.ts`

### Edamam Nutrition API:
```bash
EDAMAM_APP_ID=your_edamam_app_id_here
EDAMAM_APP_KEY=your_edamam_app_key_here
```
**Used in**: `app/api/edamam-nutrition/route.ts`, `lib/env-validation.ts`

## ✅ **OPTIONAL** (Advanced Features)

### OpenAI API:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```
**Used in**: `lib/env-validation.ts` (referenced but not actively used in current API routes)

### Brave Search API:
```bash
BRAVE_API_KEY=your_brave_api_key_here
```
**Used in**: `app/api/get-nutrition/route.ts` (optional, has fallback)

## ❌ **NOT REQUIRED** (Listed in guides but not used)

### NextAuth Variables:
```bash
# These are NOT used in the codebase
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```
**Reason**: The app uses Supabase Auth, not NextAuth

### Firebase Variables:
```bash
# These are NOT used in the main app
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```
**Reason**: Only used in an unused Firebase-to-Supabase migration route

## 📋 **MINIMAL .env.local FOR DEVELOPMENT**

For basic functionality, you only need:
```bash
# Essential Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional for enhanced features
CLARIFAI_API_KEY=your_clarifai_api_key_here
EDAMAM_APP_ID=your_edamam_app_id_here
EDAMAM_APP_KEY=your_edamam_app_key_here
```

## 🎯 **FEATURE AVAILABILITY**

### With Just Supabase:
- ✅ User authentication
- ✅ Manual food input
- ✅ Basic nutritional analysis (fallback data)
- ✅ Database storage
- ✅ Food scan history

### With + Clarifai:
- ✅ Camera food recognition
- ✅ Automatic food identification

### With + Edamam:
- ✅ Accurate nutritional data
- ✅ Detailed macro/micronutrient info

### With + OpenAI:
- ✅ Advanced AI analysis (if implemented)

### With + Brave:
- ✅ Additional nutrition data (optional)

## 🔧 **RECOMMENDATIONS**

1. **Update ENV_SETUP_GUIDE.md** to remove NextAuth and Firebase variables
2. **Update DEPLOYMENT_GUIDE.md** to reflect actual requirements
3. **Update PRODUCTION_BUILD_GUIDE.md** to remove unused variables
4. **Keep Firebase route** but mark it as unused/migration-only

## ✅ **VERIFICATION**

You can verify which APIs are configured by visiting:
- `/api/check-env` - Shows environment status
- The app gracefully handles missing APIs with fallbacks
