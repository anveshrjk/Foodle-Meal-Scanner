export async function POST(req: Request) {
  try {
    const { 
      foodName, 
      clarifaiData, 
      openFoodFactsData, 
      edamamData, 
      userProfile 
    } = await req.json()

    if (!foodName) {
      return Response.json({ error: "Food name required" }, { status: 400 })
    }

    // Combine nutritional data from all sources
    const combinedNutrition = combineNutritionalData(openFoodFactsData, edamamData)
    
    // Calculate health score
    const healthScore = calculateHealthScore(combinedNutrition, userProfile)
    
    // Generate verdict
    const verdict = generateVerdict(foodName, healthScore, combinedNutrition, userProfile)
    
    // Generate recommendations
    const recommendations = generateRecommendations(combinedNutrition, userProfile, healthScore)
    
    // Generate humorous response
    const humorousResponse = generateHumorousResponse(foodName, healthScore, verdict.is_recommended)

    return Response.json({
      success: true,
      food_name: foodName,
      health_score: healthScore,
      verdict,
      recommendations,
      humorous_response: humorousResponse,
      nutritional_data: combinedNutrition,
      confidence: {
        clarifai: clarifaiData?.confidence || 0,
        openfoodfacts: openFoodFactsData ? 0.8 : 0,
        edamam: edamamData ? 0.9 : 0
      }
    })

  } catch (error) {
    console.error("Verdict engine error:", error)
    return Response.json({ 
      error: "Failed to generate verdict",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

function combineNutritionalData(openFoodFactsData: any, edamamData: any) {
  // Prioritize Edamam data as it's more accurate, fallback to Open Food Facts
  const primary = edamamData?.nutrition || openFoodFactsData?.nutrition || {}
  
  return {
    calories: primary.calories || 0,
    protein: primary.protein || 0,
    carbs: primary.carbs || 0,
    fat: primary.fat || 0,
    fiber: primary.fiber || 0,
    sugar: primary.sugar || 0,
    sodium: primary.sodium || 0,
    saturated_fat: primary.saturated_fat || 0,
    cholesterol: primary.cholesterol || 0,
    vitamins: primary.vitamins || [],
    minerals: primary.minerals || [],
    allergens: primary.allergens || [],
    health_labels: primary.health_labels || [],
    diet_labels: primary.diet_labels || []
  }
}

function calculateHealthScore(nutrition: any, userProfile: any): number {
  let score = 50 // Base score

  // Protein analysis (0-20 points)
  if (nutrition.protein > 20) score += 20
  else if (nutrition.protein > 15) score += 15
  else if (nutrition.protein > 10) score += 10
  else if (nutrition.protein > 5) score += 5

  // Fiber analysis (0-15 points)
  if (nutrition.fiber > 8) score += 15
  else if (nutrition.fiber > 5) score += 10
  else if (nutrition.fiber > 3) score += 5

  // Calorie analysis (0-15 points)
  if (nutrition.calories < 100) score += 15
  else if (nutrition.calories < 200) score += 10
  else if (nutrition.calories < 300) score += 5
  else if (nutrition.calories > 500) score -= 10

  // Sugar analysis (0-15 points)
  if (nutrition.sugar < 5) score += 15
  else if (nutrition.sugar < 10) score += 10
  else if (nutrition.sugar < 15) score += 5
  else if (nutrition.sugar > 25) score -= 15

  // Fat analysis (0-10 points)
  if (nutrition.fat < 5) score += 10
  else if (nutrition.fat < 10) score += 5
  else if (nutrition.fat > 20) score -= 5

  // Sodium analysis (0-10 points)
  if (nutrition.sodium < 200) score += 10
  else if (nutrition.sodium < 400) score += 5
  else if (nutrition.sodium > 600) score -= 10

  // User profile adjustments
  if (userProfile) {
    // Weight loss goals
    if (userProfile.health_goals?.includes("weight_loss")) {
      if (nutrition.calories > 250) score -= 10
      if (nutrition.fat > 15) score -= 8
      if (nutrition.protein > 15) score += 10
    }

    // Muscle building goals
    if (userProfile.health_goals?.includes("muscle_gain")) {
      if (nutrition.protein > 20) score += 15
      else if (nutrition.protein < 10) score -= 10
    }

    // Diabetes management
    if (userProfile.dietary_restrictions?.includes("diabetes")) {
      if (nutrition.sugar > 5) score -= 15
      if (nutrition.carbs > 30) score -= 10
      if (nutrition.fiber > 5) score += 10
    }

    // Heart health
    if (userProfile.health_conditions?.includes("heart_disease")) {
      if (nutrition.fat > 15) score -= 12
      if (nutrition.sodium > 400) score -= 10
      if (nutrition.fiber > 5) score += 8
    }

    // High blood pressure
    if (userProfile.health_conditions?.includes("high_blood_pressure")) {
      if (nutrition.sodium > 400) score -= 15
      if (nutrition.sugar > 8) score -= 8
    }
  }

  return Math.max(0, Math.min(100, score))
}

function generateVerdict(foodName: string, healthScore: number, nutrition: any, userProfile: any) {
  const isRecommended = healthScore >= 60
  
  let reason = ""
  let warnings = []
  let benefits = []

  // Generate reason based on health score
  if (healthScore >= 85) {
    reason = `Excellent choice! ${foodName} scores ${healthScore}/100. This is a nutritional powerhouse! 🚀`
  } else if (healthScore >= 70) {
    reason = `Good choice! ${foodName} scores ${healthScore}/100. Your body will thank you! 👍`
  } else if (healthScore >= 60) {
    reason = `Decent choice! ${foodName} scores ${healthScore}/100. Not bad, but room for improvement! 🤔`
  } else if (healthScore >= 40) {
    reason = `Hmm, ${foodName} scores ${healthScore}/100. Maybe consider alternatives? 🤷‍♀️`
  } else {
    reason = `Yikes! ${foodName} scores ${healthScore}/100. Your body is sending SOS signals! 🆘`
  }

  // Generate warnings
  if (nutrition.sugar > 15) warnings.push("🍭 High sugar content - your dentist is concerned!")
  if (nutrition.sodium > 600) warnings.push("🧂 Sodium overload - your blood pressure is not happy!")
  if (nutrition.fat > 20) warnings.push("🍔 High fat content - your heart is asking for mercy!")
  if (nutrition.calories > 400) warnings.push("⚖️ Calorie bomb - your waistline is watching!")

  // Generate benefits
  if (nutrition.protein > 15) benefits.push("💪 Protein powerhouse - your muscles are celebrating!")
  if (nutrition.fiber > 5) benefits.push("🌾 Fiber champion - your gut bacteria are throwing a party!")
  if (nutrition.calories < 150) benefits.push("🎯 Low-calorie winner - your metabolism is impressed!")
  if (nutrition.fat < 5) benefits.push("✨ Low-fat legend - your heart is sending love letters!")

  return {
    is_recommended: isRecommended,
    reason,
    warnings: warnings.slice(0, 3),
    benefits: benefits.slice(0, 3),
    health_score: healthScore
  }
}

function generateRecommendations(nutrition: any, userProfile: any, healthScore: number) {
  const tips = []

  // General tips
  if (nutrition.protein < 10) tips.push("💪 Add some protein - your muscles are probably crying for help!")
  if (nutrition.fiber < 3) tips.push("🥬 Throw in some veggies - your digestive system will thank you!")
  if (nutrition.calories > 250) tips.push("📏 Portion control is key - your waistline is watching!")
  if (nutrition.sugar > 8) tips.push("🍭 Easy on the sugar - your dentist and pancreas are both concerned!")
  if (nutrition.fat > 15) tips.push("⚖️ Balance is everything - maybe skip the extra butter next time?")

  // User-specific tips
  if (userProfile?.health_goals?.includes("weight_loss")) {
    tips.push("🎯 For weight loss, consider smaller portions and pair with vegetables!")
  }
  if (userProfile?.health_goals?.includes("muscle_gain")) {
    tips.push("💪 For muscle building, add more protein sources to this meal!")
  }
  if (userProfile?.dietary_restrictions?.includes("diabetes")) {
    tips.push("🍯 Monitor your blood sugar and consider lower-carb alternatives!")
  }

  return {
    tips: tips.slice(0, 4),
    portion_suggestion: getPortionSuggestion(healthScore),
    pairing_suggestions: getPairingSuggestions(nutrition)
  }
}

function getPortionSuggestion(healthScore: number): string {
  if (healthScore >= 80) return "Full portion - go ahead and enjoy! 🎉"
  if (healthScore >= 60) return "Moderate portion - balance is key! ⚖️"
  if (healthScore >= 40) return "Small portion - less is more! 📏"
  return "Tiny portion - or better yet, skip it! 🚫"
}

function getPairingSuggestions(nutrition: any): string[] {
  const suggestions = []
  
  if (nutrition.protein < 10) suggestions.push("Add grilled chicken or tofu")
  if (nutrition.fiber < 5) suggestions.push("Pair with a side salad")
  if (nutrition.vitamins.length < 3) suggestions.push("Add colorful vegetables")
  if (nutrition.calories < 200) suggestions.push("Consider adding healthy fats like avocado")
  
  return suggestions.slice(0, 3)
}

function generateHumorousResponse(foodName: string, healthScore: number, isRecommended: boolean) {
  const responses = {
    excellent: [
      `🎉 Wah! ${foodName} is absolutely brilliant! Your taste buds and body are doing a synchronized dance! 💃`,
      `🔥 Boom! ${foodName} is a nutritional superstar! You're basically a health guru now! 🧘‍♀️`,
      `✨ Outstanding! ${foodName} is what we call a perfect match! Your future self is high-fiving you! 🙏`
    ],
    good: [
      `👍 Nice one! ${foodName} gets a solid thumbs up from your body! 👍`,
      `😊 Good choice! Your body is giving you a subtle nod of approval! 🎯`,
      `💪 Solid pick! You're building some great health habits! 🏗️`
    ],
    moderate: [
      `🤔 Hmm, ${foodName} is okay, but your body deserves something more exciting! 🎢`,
      `😐 It's not terrible, but maybe we can do better next time? 🤷‍♀️`,
      `🤨 It's like that friend who's nice but not your bestie! 👫`
    ],
    poor: [
      `😬 Oops! ${foodName} is making your body do the side-eye! 👀`,
      `🤯 Yikes! It's like eating a delicious mistake! 😅`,
      `😱 Your future self is probably shaking their head right now! 🤦‍♀️`
    ]
  }

  let category = 'poor'
  if (healthScore >= 85) category = 'excellent'
  else if (healthScore >= 70) category = 'good'
  else if (healthScore >= 50) category = 'moderate'

  const categoryResponses = responses[category as keyof typeof responses]
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)]
}
