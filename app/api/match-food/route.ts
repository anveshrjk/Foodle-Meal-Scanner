import { foodRecognitionService } from "@/lib/food-recognition"

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}

function similarity(a: string, b: string) {
  const as = new Set(normalize(a).split(" "))
  const bs = new Set(normalize(b).split(" "))
  const inter = new Set([...as].filter((x) => bs.has(x)))
  const union = new Set([...as, ...bs])
  return union.size === 0 ? 0 : inter.size / union.size
}

export async function POST(req: Request) {
  try {
    const { foodName, description } = await req.json()
    if (!foodName) {
      return Response.json({ error: "No food name provided" }, { status: 400 })
    }

    // Use internal search first
    const candidates = foodRecognitionService.searchFood(foodName)
    let best = candidates[0]
    let bestScore = -1
    for (const item of candidates) {
      const score = Math.max(
        similarity(foodName, item.name),
        ...item.common_names.map((n) => similarity(foodName, n)),
        description ? similarity(description, item.name) : 0,
      )
      if (score > bestScore) {
        best = item
        bestScore = score
      }
    }

    if (!best) {
      return Response.json({ match: null }, { status: 200 })
    }

    const recommendation = foodRecognitionService.generateRecommendation(best)

    return Response.json({
      match: {
        name: best.name,
        category: best.category,
        nutritional_data: best.nutritional_data,
        confidence: Math.min(0.98, Math.max(0.6, bestScore)),
      },
      recommendation,
    })
  } catch (error) {
    console.error("Food match error:", error)
    return Response.json({ error: "Failed to match food" }, { status: 500 })
  }
}


