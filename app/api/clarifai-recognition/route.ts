export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image || !image.includes('base64')) {
      return Response.json({ error: "Invalid image format. Must be base64 encoded." }, { status: 400 })
    }

    const base64Data = image.split(',')[1]
    if (!base64Data) {
      return Response.json({ error: "Invalid base64 image data" }, { status: 400 })
    }

    // Validate Clarifai API key
    const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY?.trim()
    if (!CLARIFAI_API_KEY) {
      return Response.json({ error: "Clarifai API key not configured" }, { status: 500 })
    }

    try {
      const response = await fetch('https://api.clarifai.com/v2/models/food-item-recognition/outputs', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [
            {
              data: {
                image: {
                  base64: base64Data
                }
              }
            }
          ]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Clarifai API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      
      // Extract food predictions from Clarifai response
      const concepts = data.outputs?.[0]?.data?.concepts || []
      
      // Filter for food-related concepts and sort by confidence
      const foodConcepts = concepts
        .filter((concept: any) => concept.value > 0.1) // Filter low confidence predictions
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5) // Get top 5 predictions

      if (foodConcepts.length === 0) {
        return Response.json({ 
          error: "No food items detected in the image",
          concepts: []
        }, { status: 400 })
      }

      // Format the response
      const foodItems = foodConcepts.map((concept: any) => ({
        name: concept.name,
        confidence: concept.value,
        description: `Detected food item: ${concept.name}`
      }))

      return Response.json({
        success: true,
        foodItems,
        primaryFood: foodItems[0] // The most confident prediction
      })

    } catch (error) {
      console.error("Clarifai API request error:", error)
      return Response.json({ 
        error: "Failed to process image with Clarifai",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Clarifai recognition error:", error)
    return Response.json({ 
      error: "Failed to recognize food items",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
