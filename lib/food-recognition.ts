interface NutritionalData {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium?: number
  calcium?: number
  iron?: number
}

interface FoodItem {
  name: string
  category: string
  nutritional_data: NutritionalData
  common_names: string[]
  ingredients?: string[]
  allergens?: string[]
}

// Comprehensive Indian and international food database
const FOOD_DATABASE: FoodItem[] = [
  // Indian Staples
  {
    name: "Basmati Rice",
    category: "grains",
    nutritional_data: { calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, sugar: 0.1 },
    common_names: ["basmati", "white rice", "steamed rice"],
  },
  {
    name: "Chapati",
    category: "bread",
    nutritional_data: { calories: 104, protein: 3.1, carbs: 18, fat: 2.5, fiber: 2.8, sugar: 0.4 },
    common_names: ["roti", "chapati", "flatbread", "indian bread"],
  },
  {
    name: "Dal Tadka",
    category: "curry",
    nutritional_data: { calories: 180, protein: 12, carbs: 28, fat: 4, fiber: 8, sugar: 2 },
    common_names: ["dal", "lentil curry", "yellow dal", "toor dal"],
  },
  {
    name: "Chicken Curry",
    category: "curry",
    nutritional_data: { calories: 250, protein: 25, carbs: 8, fat: 14, fiber: 2, sugar: 4 },
    common_names: ["chicken curry", "murgh curry", "indian chicken"],
  },
  {
    name: "Paneer Butter Masala",
    category: "curry",
    nutritional_data: { calories: 320, protein: 14, carbs: 12, fat: 26, fiber: 3, sugar: 8 },
    common_names: ["paneer", "paneer masala", "cottage cheese curry"],
  },
  {
    name: "Biryani",
    category: "rice",
    nutritional_data: { calories: 290, protein: 8, carbs: 45, fat: 9, fiber: 2, sugar: 3 },
    common_names: ["biryani", "biriyani", "dum biryani", "chicken biryani"],
  },
  {
    name: "Samosa",
    category: "snack",
    nutritional_data: { calories: 262, protein: 6, carbs: 24, fat: 16, fiber: 3, sugar: 2 },
    common_names: ["samosa", "samosas", "fried snack"],
  },
  {
    name: "Dosa",
    category: "bread",
    nutritional_data: { calories: 168, protein: 4, carbs: 25, fat: 6, fiber: 1, sugar: 1 },
    common_names: ["dosa", "masala dosa", "south indian crepe"],
  },
  {
    name: "Idli",
    category: "bread",
    nutritional_data: { calories: 58, protein: 2, carbs: 12, fat: 0.3, fiber: 0.8, sugar: 0.1 },
    common_names: ["idli", "steamed cake", "south indian"],
  },
  {
    name: "Rajma",
    category: "curry",
    nutritional_data: { calories: 200, protein: 13, carbs: 32, fat: 3, fiber: 11, sugar: 4 },
    common_names: ["rajma", "kidney bean curry", "red beans"],
  },

  // International Foods
  {
    name: "Grilled Chicken Breast",
    category: "protein",
    nutritional_data: { calories: 231, protein: 43.5, carbs: 0, fat: 5, fiber: 0, sugar: 0 },
    common_names: ["chicken breast", "grilled chicken", "chicken"],
  },
  {
    name: "Salmon Fillet",
    category: "protein",
    nutritional_data: { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0 },
    common_names: ["salmon", "fish", "grilled salmon"],
  },
  {
    name: "Greek Yogurt",
    category: "dairy",
    nutritional_data: { calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sugar: 6 },
    common_names: ["yogurt", "greek yogurt", "plain yogurt"],
  },
  {
    name: "Quinoa",
    category: "grains",
    nutritional_data: { calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, sugar: 1.6 },
    common_names: ["quinoa", "quinoa bowl"],
  },
  {
    name: "Avocado",
    category: "fruit",
    nutritional_data: { calories: 234, protein: 2.9, carbs: 12, fat: 21, fiber: 10, sugar: 1 },
    common_names: ["avocado", "avocado toast"],
  },
  {
    name: "Sweet Potato",
    category: "vegetable",
    nutritional_data: { calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 3.9, sugar: 5.4 },
    common_names: ["sweet potato", "roasted sweet potato"],
  },
  {
    name: "Broccoli",
    category: "vegetable",
    nutritional_data: { calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5, sugar: 2.6 },
    common_names: ["broccoli", "steamed broccoli"],
  },
  {
    name: "Brown Rice",
    category: "grains",
    nutritional_data: { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sugar: 0.7 },
    common_names: ["brown rice", "whole grain rice"],
  },
]

export class FoodRecognitionService {
  private static instance: FoodRecognitionService

  static getInstance(): FoodRecognitionService {
    if (!FoodRecognitionService.instance) {
      FoodRecognitionService.instance = new FoodRecognitionService()
    }
    return FoodRecognitionService.instance
  }

  // Simulate AI image recognition with improved accuracy
  async recognizeFood(imageData: string): Promise<{ food: FoodItem; confidence: number }> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000))

    // In a real implementation, this would use computer vision APIs
    // For now, we'll use weighted random selection with bias toward Indian foods
    const indianFoods = FOOD_DATABASE.filter(
      (food) =>
        ["curry", "bread", "rice", "snack"].includes(food.category) &&
        food.common_names.some((name) =>
          ["dal", "chapati", "biryani", "paneer", "dosa", "idli", "rajma", "samosa"].includes(name.toLowerCase()),
        ),
    )

    const allFoods = FOOD_DATABASE

    // 60% chance of Indian food, 40% international
    const useIndianFood = Math.random() < 0.6
    const foodPool = useIndianFood ? indianFoods : allFoods

    const selectedFood = foodPool[Math.floor(Math.random() * foodPool.length)]
    const confidence = 0.75 + Math.random() * 0.2 // 75-95% confidence

    return { food: selectedFood, confidence }
  }

  // Search food database with fuzzy matching
  searchFood(query: string): FoodItem[] {
    const normalizedQuery = query.toLowerCase().trim()

    return FOOD_DATABASE.filter((food) => {
      const nameMatch = food.name.toLowerCase().includes(normalizedQuery)
      const commonNameMatch = food.common_names.some((name) => name.toLowerCase().includes(normalizedQuery))
      const categoryMatch = food.category.toLowerCase().includes(normalizedQuery)

      return nameMatch || commonNameMatch || categoryMatch
    }).slice(0, 10) // Limit to 10 results
  }

  // Generate personalized recommendation
  generateRecommendation(
    food: FoodItem,
    userProfile?: any,
  ): {
    is_recommended: boolean
    reason: string
    tips: string[]
    health_score: number
  } {
    const { nutritional_data } = food

    // Calculate health score based on nutritional balance
    let healthScore = 50 // Base score

    // Protein bonus
    if (nutritional_data.protein > 15) healthScore += 20
    else if (nutritional_data.protein > 8) healthScore += 10

    // Fiber bonus
    if (nutritional_data.fiber > 5) healthScore += 15
    else if (nutritional_data.fiber > 3) healthScore += 8

    // Calorie penalty for high-calorie foods
    if (nutritional_data.calories > 300) healthScore -= 15
    else if (nutritional_data.calories > 200) healthScore -= 5

    // Sugar penalty
    if (nutritional_data.sugar > 10) healthScore -= 20
    else if (nutritional_data.sugar > 5) healthScore -= 10

    // Fat balance
    if (nutritional_data.fat > 20) healthScore -= 10
    else if (nutritional_data.fat < 2) healthScore += 5

    healthScore = Math.max(0, Math.min(100, healthScore))

    const isRecommended = healthScore >= 60

    const tips = []
    if (nutritional_data.protein < 10) tips.push("Consider adding a protein source")
    if (nutritional_data.fiber < 3) tips.push("Add vegetables or fruits for more fiber")
    if (nutritional_data.calories > 250) tips.push("Watch your portion size")
    if (nutritional_data.sugar > 8) tips.push("Be mindful of sugar content")
    if (nutritional_data.fat > 15) tips.push("Balance with low-fat foods throughout the day")

    // Add positive tips
    if (nutritional_data.protein > 15) tips.push("Great protein content!")
    if (nutritional_data.fiber > 5) tips.push("Excellent fiber source")
    if (nutritional_data.calories < 150) tips.push("Low-calorie option")

    const reason = isRecommended
      ? `${food.name} is a good choice! It has balanced nutrition with a health score of ${healthScore}/100.`
      : `${food.name} might not be ideal right now. Health score: ${healthScore}/100. Consider portion control or alternatives.`

    return {
      is_recommended: isRecommended,
      reason,
      tips: tips.slice(0, 3), // Limit to 3 tips
      health_score: healthScore,
    }
  }
}

export const foodRecognitionService = FoodRecognitionService.getInstance()
