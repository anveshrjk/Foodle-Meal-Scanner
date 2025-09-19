export async function POST(req: Request) {
  try {
    const { foodName, description } = await req.json()

    if (!foodName) {
      return Response.json({ error: "No food name provided" }, { status: 400 })
    }

    const searchQuery = `${foodName} nutrition facts calories protein carbs fiber vitamins minerals`

    // Search for nutritional information
    const searchResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          "X-Subscription-Token": process.env.BRAVE_API_KEY || "",
        },
      },
    )

    let nutritionData = null

    if (searchResponse.ok) {
      const searchResults = await searchResponse.json()

      // Extract nutrition information from search results
      const relevantResults = searchResults.web?.results?.slice(0, 3) || []

      // Use AI to extract structured nutrition data from search results
      const nutritionAnalysis = await fetch("/api/extract-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName,
          searchResults: relevantResults,
        }),
      })

      if (nutritionAnalysis.ok) {
        nutritionData = await nutritionAnalysis.json()
      }
    }

    // Fallback to estimated nutrition if search fails
    if (!nutritionData) {
      nutritionData = await getEstimatedNutrition(foodName, description)
    }

    return Response.json({ nutrition: nutritionData })
  } catch (error) {
    console.error("Nutrition lookup error:", error)
    return Response.json({ error: "Failed to get nutrition data" }, { status: 500 })
  }
}

async function getEstimatedNutrition(foodName: string, description: string) {
  const { openai } = await import("@ai-sdk/openai")
  const { generateObject } = await import("ai")
  const { z } = await import("zod")

  const nutritionSchema = z.object({
    calories: z.number().describe("Estimated calories per 100g"),
    protein: z.number().describe("Protein in grams per 100g"),
    carbs: z.number().describe("Carbohydrates in grams per 100g"),
    fat: z.number().describe("Fat in grams per 100g"),
    fiber: z.number().describe("Fiber in grams per 100g"),
    sugar: z.number().describe("Sugar in grams per 100g"),
    sodium: z.number().describe("Sodium in mg per 100g"),
    healthScore: z.number().min(1).max(10).describe("Health score from 1-10"),
    healthTips: z.array(z.string()).describe("Health tips and benefits"),
  })

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: nutritionSchema,
    prompt: `Provide estimated nutritional information for ${foodName}. Description: ${description}. Focus on accuracy for Indian foods and traditional dishes.`,
    maxOutputTokens: 800,
  })

  return object
}
