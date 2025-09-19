# Foodle Deployment Guide for Vercel

## Environment Variables Required

To deploy this application to Vercel, you need to set up the following environment variables in your Vercel dashboard:

### Required Environment Variables:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://your-project-id.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Found in your Supabase dashboard under Settings > API

3. **OPENAI_API_KEY**
   - Your OpenAI API key for GPT-4 Vision
   - Required for food image analysis
   - Get from: https://platform.openai.com/api-keys

4. **BRAVE_API_KEY** (Optional)
   - Brave Search API key for nutrition data
   - If not provided, the app will use fallback nutrition estimation
   - Get from: https://brave.com/search/api/

### How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your Foodle project
3. Go to Settings > Environment Variables
4. Add each variable with the appropriate value
5. Make sure to set them for Production, Preview, and Development environments

## Deployment Steps:

1. **Push your code to the main branch** (this will trigger automatic deployment)
2. **Set up environment variables** in Vercel dashboard
3. **Wait for deployment to complete**
4. **Test the application** to ensure everything works

## Features Implemented:

✅ **Enhanced Camera Interface**
- Live camera preview with grid overlay
- "Capture & Analyse Meal" button
- Improved user experience

✅ **Improved Food Recognition**
- Enhanced AI prompts for better accuracy
- Cross-referencing with comprehensive food database
- Better Indian and international food recognition

✅ **Advanced Health Analysis**
- Personalized recommendations based on user profile
- Health score calculation (0-100)
- Detailed warnings and benefits
- User-specific health considerations

✅ **Enhanced Results Display**
- Health score visualization
- Warnings and benefits sections
- Improved nutritional breakdown

## Database Requirements:

The application uses Supabase for:
- User authentication
- User profiles
- Food scan history
- Session management

Make sure your Supabase database has the following tables:
- `profiles` - User profile information
- `food_scans` - Scan history and results

## Notes:

- All changes are deployment-safe for Vercel
- No breaking changes to existing functionality
- Enhanced user experience with better AI accuracy
- Comprehensive health analysis system
