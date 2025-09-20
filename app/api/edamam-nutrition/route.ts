export async function POST(req: Request) {
  try {
    const { foodName, image } = await req.json()

    if (!foodName) {
      return Response.json({ error: "Food name required" }, { status: 400 })
    }

    const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID?.trim()
    const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY?.trim()

    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      console.error("Missing Edamam credentials", { EDAMAM_APP_ID: !!EDAMAM_APP_ID, EDAMAM_APP_KEY: !!EDAMAM_APP_KEY })
      return Response.json({ error: "Edamam API credentials not configured" }, { status: 500 })
    }

    // Search for food in Edamam database
    const searchQuery = encodeURIComponent(foodName)
    const searchUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${searchQuery}&nutrition-type=cooking`

    try {
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json()
        throw new Error(`Edamam search API error: ${searchResponse.status} - ${JSON.stringify(errorData)}`)
      }

      const searchData = await searchResponse.json()
      
      if (!searchData.hints || searchData.hints.length === 0) {
        return Response.json({ 
          error: "No nutritional data found for this food item",
          nutrition: null
        }, { status: 404 })
      }

      // Get the best match
      const bestMatch = searchData.hints[0]
      const foodId = bestMatch.food.foodId

      // Get detailed nutritional information
      const nutritionUrl = `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`
      
      const nutritionResponse = await fetch(nutritionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: [
            {
              quantity: 100,
              measureURI: "http://www.edamam.com/ontologies/edamam.owl#Measure_gram",
              foodId: foodId
            }
          ]
        })
      })

      if (!nutritionResponse.ok) {
        throw new Error(`Edamam nutrition API error: ${nutritionResponse.status}`)
      }

      const nutritionData = await nutritionResponse.json()
      
      // Extract nutritional information
      const nutrition = {
        calories: Math.round(nutritionData.calories || 0),
        protein: Math.round((nutritionData.totalNutrients?.PROCNT?.quantity || 0) * 10) / 10,
        carbs: Math.round((nutritionData.totalNutrients?.CHOCDF?.quantity || 0) * 10) / 10,
        fat: Math.round((nutritionData.totalNutrients?.FAT?.quantity || 0) * 10) / 10,
        fiber: Math.round((nutritionData.totalNutrients?.FIBTG?.quantity || 0) * 10) / 10,
        sugar: Math.round((nutritionData.totalNutrients?.SUGAR?.quantity || 0) * 10) / 10,
        sodium: Math.round((nutritionData.totalNutrients?.NA?.quantity || 0) * 10) / 10,
        saturated_fat: Math.round((nutritionData.totalNutrients?.FASAT?.quantity || 0) * 10) / 10,
        cholesterol: Math.round((nutritionData.totalNutrients?.CHOLE?.quantity || 0) * 10) / 10,
        vitamins: extractVitaminsFromEdamam(nutritionData.totalNutrients),
        minerals: extractMineralsFromEdamam(nutritionData.totalNutrients),
        health_labels: nutritionData.healthLabels || [],
        diet_labels: nutritionData.dietLabels || [],
        cautions: nutritionData.cautions || []
      }

      return Response.json({
        success: true,
        nutrition,
        food_info: {
          name: bestMatch.food.label,
          category: bestMatch.food.category,
          foodId: bestMatch.food.foodId,
          image: bestMatch.food.image
        },
        // Add raw Edamam data for debugging
        raw_data: {
          search_results: searchData.hints?.length || 0,
          nutrition_available: !!nutritionData.totalNutrients,
          health_labels: nutritionData.healthLabels || [],
          diet_labels: nutritionData.dietLabels || []
        }
      })

    } catch (error) {
      console.error("Edamam API error:", error)
      return Response.json({ 
        error: "Failed to fetch nutritional data from Edamam",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 })
    }
  } catch (error) {
    return Response.json({ error: "Invalid request payload" }, { status: 400 })
  }
}

function extractVitaminsFromEdamam(nutrients: any): string[] {
  const vitamins = []
  const vitaminMap = {
    'VITA_RAE': 'Vitamin A',
    'THIA': 'Vitamin B1 (Thiamine)',
    'RIBF': 'Vitamin B2 (Riboflavin)',
    'NIA': 'Vitamin B3 (Niacin)',
    'PANTAC': 'Vitamin B5 (Pantothenic Acid)',
    'VITB6A': 'Vitamin B6',
    'FOLDFE': 'Vitamin B9 (Folate)',
    'VITB12': 'Vitamin B12',
    'VITC': 'Vitamin C',
    'VITD': 'Vitamin D',
    'TOCPHA': 'Vitamin E',
    'VITK1': 'Vitamin K'
  }

  for (const [key, value] of Object.entries(nutrients)) {
    if (vitaminMap[key] && value && typeof value === 'object' && 'quantity' in value && value.quantity > 0) {
      vitamins.push(vitaminMap[key])
    }
  }

  return vitamins
}

function extractMineralsFromEdamam(nutrients: any): string[] {
  const minerals = []
  const mineralMap = {
    'CA': 'Calcium',
    'FE': 'Iron',
    'MG': 'Magnesium',
    'P': 'Phosphorus',
    'K': 'Potassium',
    'NA': 'Sodium',
    'ZN': 'Zinc',
    'CU': 'Copper',
    'MN': 'Manganese',
    'SE': 'Selenium'
  }

  for (const [key, value] of Object.entries(nutrients)) {
    if (mineralMap[key] && value && typeof value === 'object' && 'quantity' in value && value.quantity > 0) {
      minerals.push(mineralMap[key])
    }
  }

  return minerals
}
