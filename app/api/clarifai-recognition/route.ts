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

    // Validate Clarifai API key and workflow ID
    const CLARIFAI_API_KEY = process.env.CLARIFAI_API_KEY?.trim()
    const CLARIFAI_WORKFLOW_ID = process.env.CLARIFAI_WORKFLOW_ID?.trim() || "General"
    
    if (!CLARIFAI_API_KEY) {
      return Response.json({ error: "Clarifai API key not configured" }, { status: 500 })
    }

    try {
      // Use Clarifai Workflow API instead of direct model API
      const url = `https://api.clarifai.com/v2/workflows/${CLARIFAI_WORKFLOW_ID}/results`
      
      const requestBody = {
        inputs: [
          {
            data: {
              image: {
                base64: base64Data
              }
            }
          }
        ]
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        let errorMessage = `Clarifai Workflow API error: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage += ` - ${JSON.stringify(errorData)}`
          
          // Handle specific workflow errors
          if (response.status === 400) {
            errorMessage = `Invalid workflow request. Please check your image format and workflow ID (${CLARIFAI_WORKFLOW_ID}).`
          } else if (response.status === 401) {
            errorMessage = "Invalid Clarifai API key. Please check your CLARIFAI_API_KEY environment variable."
          } else if (response.status === 404) {
            errorMessage = `Workflow '${CLARIFAI_WORKFLOW_ID}' not found. Please check your CLARIFAI_WORKFLOW_ID environment variable.`
          } else if (response.status === 429) {
            errorMessage = "Clarifai API rate limit exceeded. Please try again later."
          }
        } catch (parseError) {
          errorMessage += ` - Unable to parse error response`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Extract food predictions from workflow response
      // The workflow response structure may vary based on the workflow configuration
      let concepts: any[] = []
      
      try {
        if (data.results && data.results[0] && data.results[0].outputs) {
          // Handle workflow output structure
          const outputs = data.results[0].outputs
          for (const output of outputs) {
            if (output.data && output.data.concepts) {
              concepts = concepts.concat(output.data.concepts)
            }
          }
        } else if (data.outputs && data.outputs[0] && data.outputs[0].data && data.outputs[0].data.concepts) {
          // Fallback to direct model response structure
          concepts = data.outputs[0].data.concepts
        } else {
          // Log the response structure for debugging
          console.warn("Unexpected Clarifai workflow response structure:", JSON.stringify(data, null, 2))
          throw new Error("Unexpected response format from Clarifai workflow")
        }
      } catch (parseError) {
        console.error("Error parsing Clarifai workflow response:", parseError)
        throw new Error("Failed to parse Clarifai workflow response")
      }
      
      // Filter for food-related concepts and sort by confidence
      const foodConcepts = concepts
        .filter((concept: any) => concept.value > 0.1) // Filter low confidence predictions
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5) // Get top 5 predictions

      if (foodConcepts.length === 0) {
        return Response.json({ 
          error: "No food items detected in the image",
          concepts: [],
          workflowResponse: data // Include full response for debugging
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
        primaryFood: foodItems[0], // The most confident prediction
        workflowId: CLARIFAI_WORKFLOW_ID,
        totalConcepts: concepts.length,
        confidence: foodItems[0]?.confidence || 0,
        processingTime: new Date().toISOString(),
        apiVersion: "workflow-v2"
      })

    } catch (error) {
      console.error("Clarifai Workflow API request error:", error)
      return Response.json({ 
        error: "Failed to process image with Clarifai Workflow",
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
