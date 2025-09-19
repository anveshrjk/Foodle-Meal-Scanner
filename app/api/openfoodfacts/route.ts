export async function POST(req: Request) {
  try {
    const { foodName, barcode } = await req.json()

    if (!foodName && !barcode) {
      return Response.json({ error: "Food name or barcode required" }, { status: 400 })
    }

    let searchResults = []

    // Search by barcode if provided
    if (barcode) {
      const barcodeResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      if (barcodeResponse.ok) {
        const barcodeData = await barcodeResponse.json()
        if (barcodeData.status === 1) {
          searchResults.push(barcodeData.product)
        }
      }
    }

    // Search by food name if no barcode results or barcode not provided
    if (searchResults.length === 0) {
      const searchQuery = encodeURIComponent(foodName)
      const searchResponse = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&search_simple=1&action=process&json=1&page_size=5`)
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        searchResults = searchData.products || []
      }
    }

    if (searchResults.length === 0) {
      return Response.json({ 
        error: "No nutritional data found for this food item",
        nutrition: null
      }, { status: 404 })
    }

    // Get the best match (first result)
    const product = searchResults[0]
    
    // Extract nutritional information
    const nutrition = {
      calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0,
      protein: product.nutriments?.['proteins_100g'] || product.nutriments?.proteins || 0,
      carbs: product.nutriments?.['carbohydrates_100g'] || product.nutriments?.carbohydrates || 0,
      fat: product.nutriments?.['fat_100g'] || product.nutriments?.fat || 0,
      fiber: product.nutriments?.['fiber_100g'] || product.nutriments?.fiber || 0,
      sugar: product.nutriments?.['sugars_100g'] || product.nutriments?.sugars || 0,
      sodium: product.nutriments?.['sodium_100g'] || product.nutriments?.sodium || 0,
      saturated_fat: product.nutriments?.['saturated-fat_100g'] || product.nutriments?.['saturated-fat'] || 0,
      salt: product.nutriments?.['salt_100g'] || product.nutriments?.salt || 0,
      vitamins: extractVitamins(product.nutriments),
      minerals: extractMinerals(product.nutriments),
      allergens: product.allergens_tags || [],
      additives: product.additives_tags || [],
      ingredients: product.ingredients_text || "",
      brand: product.brands || "",
      product_name: product.product_name || foodName,
      image_url: product.image_url || product.image_front_url || "",
      nutrition_grade: product.nutrition_grades || "unknown",
      nova_group: product.nova_group || 0
    }

    return Response.json({
      success: true,
      nutrition,
      product_info: {
        name: product.product_name,
        brand: product.brands,
        barcode: product.code,
        image_url: product.image_url || product.image_front_url,
        nutrition_grade: product.nutrition_grades,
        nova_group: product.nova_group
      }
    })

  } catch (error) {
    console.error("Open Food Facts API error:", error)
    return Response.json({ 
      error: "Failed to fetch nutritional data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

function extractVitamins(nutriments: any): string[] {
  const vitamins = []
  const vitaminPrefixes = ['vitamin-a', 'vitamin-b', 'vitamin-c', 'vitamin-d', 'vitamin-e', 'vitamin-k']
  
  for (const [key, value] of Object.entries(nutriments)) {
    if (typeof value === 'number' && value > 0) {
      for (const prefix of vitaminPrefixes) {
        if (key.toLowerCase().includes(prefix)) {
          vitamins.push(key.replace(/_/g, ' ').toUpperCase())
          break
        }
      }
    }
  }
  
  return vitamins
}

function extractMinerals(nutriments: any): string[] {
  const minerals = []
  const mineralNames = ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'zinc', 'copper', 'manganese', 'selenium']
  
  for (const [key, value] of Object.entries(nutriments)) {
    if (typeof value === 'number' && value > 0) {
      for (const mineral of mineralNames) {
        if (key.toLowerCase().includes(mineral)) {
          minerals.push(key.replace(/_/g, ' ').toUpperCase())
          break
        }
      }
    }
  }
  
  return minerals
}
