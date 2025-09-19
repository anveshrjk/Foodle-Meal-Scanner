import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const nutritionExtractionSchema = z.object({
  calories: z.number().describe("Calories per 100g"),
  protein: z.number().describe("Protein in grams per 100g"),
  carbs: z.number().describe("Carbohydrates in grams per 100g"),
  fat: z.number().describe("Fat in grams per 100g"),
  fiber: z.number().describe("Fiber in grams per 100g"),
  sugar: z.number().describe("Sugar in grams per 100g"),
  sodium: z.number().describe("Sodium in mg per 100g"),
  vitamins: z.array(z.string()).describe("Key vitamins present"),
  minerals: z.array(z.string()).describe("Key minerals present"),
  healthScore: z.number().min(1).max(10).describe("Overall health score"),
  healthTips: z.array(z.string()).describe("Health benefits and tips"),
})

export async function POST(req: Request) {
  try {
    const { foodName, searchResults } = await req.json()

    const searchText = searchResults.map((result: any) => `${result.title}: ${result.description}`).join("\n\n")

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: nutritionExtractionSchema,
      messages: [
        {
          role: "user",
          content: `Extract accurate nutritional information for "${foodName}" from these search results:\n\n${searchText}\n\nProvide nutritional values per 100g and calculate a health score based on protein content, fiber, vitamins, and overall nutritional value.`,
        },
      ],
      maxOutputTokens: 1000,
    })

    return Response.json(object)
  } catch (error) {
    console.error("Nutrition extraction error:", error)
    return Response.json({ error: "Failed to extract nutrition data" }, { status: 500 })
  }
}
