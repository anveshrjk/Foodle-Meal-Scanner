# Foodle Deployment Guide for Vercel

## Environment Variables Required

To deploy this application to Vercel, you need to set up the following environment variables in your Vercel dashboard. The application now supports **graceful degradation** - it will work with minimal configuration and provide fallbacks for missing APIs.

### Minimum Required (Core Functionality):
1. **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anonymous key  
3. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key

### Recommended (Enhanced Features):
4. **CLARIFAI_API_KEY** - For AI-powered food recognition
5. **EDAMAM_APP_ID** - For accurate nutritional data
6. **EDAMAM_APP_KEY** - For accurate nutritional data

### Optional (Advanced Features):
7. **OPENAI_API_KEY** - For advanced AI analysis
8. **BRAVE_API_KEY** - For additional nutrition data

## Feature Availability by Configuration

### ✅ Always Available (with Supabase):
- User authentication and profiles
- Manual food input
- Basic nutritional analysis with fallback data
- Food scan history
- Database storage

### ✅ With Clarifai API:
- AI-powered food recognition from photos
- Camera scanning functionality
- Automatic food identification

### ✅ With Edamam API:
- Accurate nutritional data
- Detailed macro and micronutrient information
- Food database lookup

### ✅ With OpenAI API:
- Advanced AI analysis
- Personalized recommendations
- Enhanced health insights

## How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your Foodle project
3. Go to Settings > Environment Variables
4. Add each variable with the appropriate value
5. Make sure to set them for Production, Preview, and Development environments

## Deployment Steps:

1. **Push your code to the main branch** (this will trigger automatic deployment)
2. **Set up environment variables** in Vercel dashboard (minimum: Supabase credentials)
3. **Wait for deployment to complete**
4. **Test the application** to ensure everything works
5. **Check feature availability** using the built-in environment checker at `/api/check-env`

## Environment Checker

The application includes a built-in environment checker that will tell you:
- Which APIs are configured
- Which features are available
- What's missing for full functionality
- Recommendations for optimal setup

Access it at: `https://your-domain.vercel.app/api/check-env`

## Graceful Degradation Features:

### When Clarifai API is Missing:
- Camera scanning is disabled
- Users can still use manual food input
- All other features remain functional

### When Edamam API is Missing:
- Uses fallback nutritional data
- Basic nutritional analysis still works
- All other features remain functional

### When OpenAI API is Missing:
- Uses simplified recommendation engine
- Basic health analysis still works
- All other features remain functional

## Database Requirements:

The application uses Supabase for:
- User authentication
- User profiles  
- Food scan history
- Session management

Make sure your Supabase database has the following tables:
- `profiles` - User profile information
- `food_scans` - Scan history and results

## Testing Your Deployment:

1. **Basic Test**: Try manual food input (should work with just Supabase)
2. **Camera Test**: Try camera scanning (requires Clarifai API)
3. **Nutrition Test**: Check if detailed nutrition data appears (requires Edamam API)
4. **Environment Test**: Visit `/api/check-env` to see configuration status

## Troubleshooting:

### Common Issues:
- **"Analysis Failed"**: Usually means missing API keys - check `/api/check-env`
- **Camera not working**: Check if CLARIFAI_API_KEY is set
- **Basic nutrition only**: Check if EDAMAM_APP_ID and EDAMAM_APP_KEY are set
- **Database errors**: Check Supabase credentials

### Getting API Keys:

1. **Supabase**: https://supabase.com → Create project → Settings → API
2. **Clarifai**: https://clarifai.com → Sign up → Account settings → API keys
3. **Edamam**: https://developer.edamam.com → Sign up → Create nutrition app
4. **OpenAI**: https://platform.openai.com → API keys section
5. **Brave**: https://brave.com/search/api → Sign up → Get API key

## Notes:

- ✅ **Deployment-safe**: All changes work with minimal configuration
- ✅ **Graceful degradation**: Missing APIs don't break the app
- ✅ **Environment-aware**: Features adapt based on available APIs
- ✅ **Fallback mechanisms**: Always provides basic functionality
- ✅ **User-friendly**: Clear error messages and alternatives when APIs are missing