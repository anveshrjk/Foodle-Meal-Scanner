import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const foodAnalysisSchema = z.object({
  foodName: z.string().describe("The name of the identified food item"),
  confidence: z.number().min(0).max(1).describe("Confidence level of identification (0-1)"),
  description: z.string().describe("Brief description of the food"),
  ingredients: z.array(z.string()).describe("Likely ingredients in the food"),
  cuisine: z.string().optional().describe("Type of cuisine (e.g., Indian, Italian, Chinese)"),
  category: z.enum(["main_course", "appetizer", "dessert", "snack", "beverage", "other"]),
})

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"), // Using GPT-4 Vision for image analysis
      schema: foodAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image and identify what food item it is. Be specific about the dish name, especially for Indian foods like dal, biryani, paneer dishes, etc. Provide your confidence level and describe what you see.",
            },
            {
              type: "image",
              image: image, // Base64 image data
            },
          ],
        },
      ],
      maxOutputTokens: 1000,
    })

    return Response.json({ analysis: object })
  } catch (error) {
    console.error("Food analysis error:", error)
    return Response.json({ error: "Failed to analyze food" }, { status: 500 })
  }
}
