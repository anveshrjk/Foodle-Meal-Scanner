import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { foodRecognitionService } from "@/lib/food-recognition"

const foodAnalysisSchema = z.object({
  foodName: z.string().describe("The name of the identified food item"),
  confidence: z.number().min(0).max(1).describe("Confidence level of identification (0-1)"),
  description: z.string().describe("Brief description of the food"),
  ingredients: z.array(z.string()).describe("Likely ingredients in the food"),
  cuisine: z.string().optional().describe("Type of cuisine (e.g., Indian, Italian, Chinese)"),
  category: z.enum(["main_course", "appetizer", "dessert", "snack", "beverage", "other"]),
  cookingMethod: z.string().optional().describe("Detected cooking method"),
  portionSize: z.string().optional().describe("Estimated portion size"),
})

export async function POST(req: Request) {
  try {
    const { image, foodTypes, cookingMethods, oilQuantity, mealDetails } = await req.json()

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 })
    }

    // Enhanced prompt with context from user inputs
    const contextPrompt = `
    Analyze this food image and identify what food item it is. Be extremely specific about the dish name, especially for Indian foods like dal, biryani, paneer dishes, etc.
    
    User Context:
    - Food Types: ${foodTypes?.join(', ') || 'Not specified'}
    - Cooking Methods: ${cookingMethods?.join(', ') || 'Not specified'}
    - Oil Quantity: ${oilQuantity || 50}%
    - Additional Details: ${mealDetails || 'None'}
    
    Please provide:
    1. The exact dish name (be specific for Indian dishes)
    2. Your confidence level (0-1)
    3. Detailed description of what you see
    4. Likely ingredients
    5. Cuisine type
    6. Food category
    7. Cooking method if visible
    8. Estimated portion size
    
    Focus on accuracy for Indian and international foods. If it's a traditional dish, use the proper regional name.
    `

    const { object } = await generateObject({
      model: openai("gpt-4o"), // Using GPT-4 Vision for image analysis
      schema: foodAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: contextPrompt,
            },
            {
              type: "image",
              image: image, // Base64 image data
            },
          ],
        },
      ],
      maxOutputTokens: 1500,
    })

    // Cross-reference with our food database for additional validation
    const searchResults = foodRecognitionService.searchFood(object.foodName)
    
    // If we found a match in our database, use it to enhance the analysis
    if (searchResults.length > 0) {
      const bestMatch = searchResults[0]
      object.foodName = bestMatch.name // Use the standardized name from our database
      object.confidence = Math.min(object.confidence + 0.1, 1.0) // Boost confidence
    }

    return Response.json({ analysis: object })
  } catch (error) {
    console.error("Food analysis error:", error)
    return Response.json({ error: "Failed to analyze food" }, { status: 500 })
  }
}
