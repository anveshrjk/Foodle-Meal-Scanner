# API Integration Guide for Foodle

## Required API Keys

To make the food recognition and nutritional analysis work, you need to set up the following API keys in your Vercel environment variables:

### 1. Clarifai AI (Food Recognition)
- **Purpose**: Recognizes food items in images using workflow-based analysis
- **Sign up**: https://www.clarifai.com/
- **API Key**: Get from your Clarifai dashboard
- **Workflow ID**: Use "General" for default workflow or create custom workflow
- **Environment Variables**: 
  - `CLARIFAI_API_KEY`
  - `CLARIFAI_WORKFLOW_ID` (optional, defaults to "General")

### 2. Edamam Nutrition API (Nutritional Data)
- **Purpose**: Provides detailed nutritional information
- **Sign up**: https://developer.edamam.com/
- **App ID**: Get from your Edamam dashboard
- **App Key**: Get from your Edamam dashboard
- **Environment Variables**: 
  - `EDAMAM_APP_ID`
  - `EDAMAM_APP_KEY`

### 3. Open Food Facts API (Free Nutritional Database)
- **Purpose**: Free nutritional database for packaged foods
- **No API key required**: This is a free service
- **URL**: https://world.openfoodfacts.org/

### 4. OpenAI API (Backup Analysis)
- **Purpose**: Fallback food analysis and description
- **Sign up**: https://platform.openai.com/
- **API Key**: Get from your OpenAI dashboard
- **Environment Variable**: `OPENAI_API_KEY`

## How to Set Up API Keys in Vercel

1. Go to your Vercel dashboard
2. Select your Foodle project
3. Go to Settings → Environment Variables
4. Add each API key with the exact variable names listed above
5. Redeploy your project

## API Integration Flow

1. **Camera Capture**: User takes photo of food
2. **Clarifai Recognition**: AI identifies the food item
3. **Open Food Facts**: Searches for nutritional data (free)
4. **Edamam Nutrition**: Gets detailed nutritional analysis
5. **Verdict Engine**: Combines all data to generate recommendations
6. **Results Display**: Shows humorous, personalized feedback

## Free Alternatives

If you want to test without API keys:
- Open Food Facts works without API keys
- The system will fall back to basic nutritional estimates
- Some features may be limited

## Cost Estimates

- **Clarifai**: Free tier available (1000 requests/month)
- **Edamam**: Free tier available (10 requests/minute)
- **Open Food Facts**: Completely free
- **OpenAI**: Pay-per-use (very affordable for testing)

## Testing the Integration

1. Set up at least Clarifai and Edamam APIs
2. Take a photo of any food item
3. The system should recognize the food and provide nutritional analysis
4. Check the browser console for any API errors

## Troubleshooting

- Check that all environment variables are set correctly
- Verify API keys are valid and have sufficient credits
- Check browser console for detailed error messages
- Ensure your Vercel deployment has the latest environment variables
