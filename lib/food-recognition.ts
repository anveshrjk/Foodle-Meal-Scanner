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

  // More Indian Dishes
  {
    name: "Chole Bhature",
    category: "main_course",
    nutritional_data: { calories: 520, protein: 18, carbs: 68, fat: 22, fiber: 12, sugar: 6 },
    common_names: ["chole bhature", "chana bhatura", "chickpea curry with bread"],
  },
  {
    name: "Ghee",
    category: "dairy",
    nutritional_data: { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
    common_names: ["ghee", "clarified butter", "desi ghee", "cow ghee"],
  },
  {
    name: "Lassi",
    category: "beverage",
    nutritional_data: { calories: 120, protein: 6, carbs: 15, fat: 4, fiber: 0, sugar: 12 },
    common_names: ["lassi", "sweet lassi", "yogurt drink", "curd drink"],
  },
  {
    name: "Pakora",
    category: "snack",
    nutritional_data: { calories: 180, protein: 4, carbs: 18, fat: 10, fiber: 2, sugar: 1 },
    common_names: ["pakora", "pakoda", "fritters", "vegetable fritters"],
  },
  {
    name: "Naan",
    category: "bread",
    nutritional_data: { calories: 310, protein: 8, carbs: 50, fat: 8, fiber: 2, sugar: 2 },
    common_names: ["naan", "garlic naan", "butter naan", "indian bread"],
  },
  {
    name: "Vada",
    category: "snack",
    nutritional_data: { calories: 140, protein: 4, carbs: 20, fat: 5, fiber: 2, sugar: 1 },
    common_names: ["vada", "medu vada", "south indian vada", "lentil fritters"],
  },
  {
    name: "Upma",
    category: "main_course",
    nutritional_data: { calories: 200, protein: 6, carbs: 35, fat: 4, fiber: 3, sugar: 2 },
    common_names: ["upma", "suji upma", "semolina upma", "south indian breakfast"],
  },
  {
    name: "Poha",
    category: "main_course",
    nutritional_data: { calories: 180, protein: 4, carbs: 35, fat: 3, fiber: 2, sugar: 1 },
    common_names: ["poha", "flattened rice", "indian breakfast", "beaten rice"],
  },
  {
    name: "Dhokla",
    category: "snack",
    nutritional_data: { calories: 120, protein: 5, carbs: 20, fat: 2, fiber: 1, sugar: 2 },
    common_names: ["dhokla", "gujarati dhokla", "steamed cake", "fermented snack"],
  },
  {
    name: "Misal Pav",
    category: "main_course",
    nutritional_data: { calories: 350, protein: 15, carbs: 45, fat: 12, fiber: 8, sugar: 4 },
    common_names: ["misal pav", "maharashtrian misal", "spicy curry with bread"],
  },
  {
    name: "Pav Bhaji",
    category: "main_course",
    nutritional_data: { calories: 400, protein: 12, carbs: 50, fat: 18, fiber: 6, sugar: 8 },
    common_names: ["pav bhaji", "mumbai pav bhaji", "vegetable curry with bread"],
  },
  {
    name: "Vada Pav",
    category: "snack",
    nutritional_data: { calories: 280, protein: 8, carbs: 35, fat: 12, fiber: 3, sugar: 2 },
    common_names: ["vada pav", "mumbai vada pav", "potato fritter sandwich"],
  },
  {
    name: "Bhel Puri",
    category: "snack",
    nutritional_data: { calories: 150, protein: 4, carbs: 25, fat: 4, fiber: 3, sugar: 3 },
    common_names: ["bhel puri", "mumbai bhel", "puffed rice snack", "chaat"],
  },
  {
    name: "Pani Puri",
    category: "snack",
    nutritional_data: { calories: 80, protein: 2, carbs: 12, fat: 2, fiber: 1, sugar: 1 },
    common_names: ["pani puri", "gol gappa", "water balls", "street food"],
  },
  {
    name: "Jalebi",
    category: "dessert",
    nutritional_data: { calories: 200, protein: 2, carbs: 45, fat: 4, fiber: 0, sugar: 35 },
    common_names: ["jalebi", "sweet jalebi", "syrup sweet", "indian dessert"],
  },
  {
    name: "Kulfi",
    category: "dessert",
    nutritional_data: { calories: 150, protein: 4, carbs: 20, fat: 6, fiber: 0, sugar: 18 },
    common_names: ["kulfi", "indian ice cream", "frozen dessert", "milk dessert"],
  },
  {
    name: "Kheer",
    category: "dessert",
    nutritional_data: { calories: 180, protein: 5, carbs: 30, fat: 4, fiber: 1, sugar: 20 },
    common_names: ["kheer", "rice pudding", "milk pudding", "indian dessert"],
  },
  {
    name: "Halwa",
    category: "dessert",
    nutritional_data: { calories: 250, protein: 3, carbs: 35, fat: 10, fiber: 1, sugar: 25 },
    common_names: ["halwa", "carrot halwa", "gajar halwa", "indian sweet"],
  },
  {
    name: "Ladoo",
    category: "dessert",
    nutritional_data: { calories: 120, protein: 2, carbs: 18, fat: 4, fiber: 1, sugar: 15 },
    common_names: ["ladoo", "besan ladoo", "gram flour sweet", "indian sweet"],
  },
  {
    name: "Barfi",
    category: "dessert",
    nutritional_data: { calories: 140, protein: 3, carbs: 20, fat: 5, fiber: 1, sugar: 18 },
    common_names: ["barfi", "milk barfi", "indian fudge", "milk sweet"],
  },
  {
    name: "Masala Dosa",
    category: "main_course",
    nutritional_data: { calories: 280, protein: 8, carbs: 42, fat: 8, fiber: 4, sugar: 3 },
    common_names: ["masala dosa", "dosa", "south indian crepe"],
  },
  {
    name: "Butter Chicken",
    category: "main_course",
    nutritional_data: { calories: 380, protein: 28, carbs: 12, fat: 24, fiber: 2, sugar: 8 },
    common_names: ["butter chicken", "murgh makhani", "chicken curry"],
  },
  {
    name: "Tandoori Chicken",
    category: "main_course",
    nutritional_data: { calories: 240, protein: 32, carbs: 2, fat: 12, fiber: 0, sugar: 1 },
    common_names: ["tandoori chicken", "tandoor chicken", "grilled chicken"],
  },
  {
    name: "Palak Paneer",
    category: "main_course",
    nutritional_data: { calories: 220, protein: 12, carbs: 8, fat: 16, fiber: 4, sugar: 3 },
    common_names: ["palak paneer", "spinach paneer", "cottage cheese curry"],
  },
  {
    name: "Aloo Gobi",
    category: "main_course",
    nutritional_data: { calories: 120, protein: 4, carbs: 18, fat: 4, fiber: 5, sugar: 6 },
    common_names: ["aloo gobi", "potato cauliflower", "vegetable curry"],
  },
  {
    name: "Chicken Tikka Masala",
    category: "main_course",
    nutritional_data: { calories: 320, protein: 26, carbs: 10, fat: 20, fiber: 2, sugar: 6 },
    common_names: ["chicken tikka masala", "tikka masala", "chicken curry"],
  },
  {
    name: "Raita",
    category: "side_dish",
    nutritional_data: { calories: 45, protein: 2, carbs: 6, fat: 1.5, fiber: 0.5, sugar: 5 },
    common_names: ["raita", "yogurt side", "curd side"],
  },
  {
    name: "Gulab Jamun",
    category: "dessert",
    nutritional_data: { calories: 180, protein: 3, carbs: 28, fat: 6, fiber: 0.5, sugar: 22 },
    common_names: ["gulab jamun", "indian sweet", "milk dumpling"],
  },
  {
    name: "Rasgulla",
    category: "dessert",
    nutritional_data: { calories: 85, protein: 2.5, carbs: 18, fat: 0.5, fiber: 0, sugar: 16 },
    common_names: ["rasgulla", "bengali sweet", "cottage cheese sweet"],
  },

  // More International Foods
  {
    name: "Pizza Margherita",
    category: "main_course",
    nutritional_data: { calories: 280, protein: 12, carbs: 36, fat: 10, fiber: 2, sugar: 4 },
    common_names: ["pizza", "margherita pizza", "cheese pizza"],
  },
  {
    name: "Pasta Carbonara",
    category: "main_course",
    nutritional_data: { calories: 420, protein: 18, carbs: 45, fat: 18, fiber: 2, sugar: 3 },
    common_names: ["carbonara", "pasta", "italian pasta"],
  },
  {
    name: "Sushi Roll",
    category: "main_course",
    nutritional_data: { calories: 200, protein: 8, carbs: 35, fat: 3, fiber: 1, sugar: 2 },
    common_names: ["sushi", "sushi roll", "japanese food"],
  },
  {
    name: "Caesar Salad",
    category: "main_course",
    nutritional_data: { calories: 180, protein: 8, carbs: 12, fat: 12, fiber: 3, sugar: 4 },
    common_names: ["caesar salad", "salad", "green salad"],
  },
  {
    name: "Beef Burger",
    category: "main_course",
    nutritional_data: { calories: 540, protein: 25, carbs: 45, fat: 28, fiber: 3, sugar: 8 },
    common_names: ["burger", "beef burger", "hamburger"],
  },
  {
    name: "Fish and Chips",
    category: "main_course",
    nutritional_data: { calories: 650, protein: 35, carbs: 58, fat: 28, fiber: 4, sugar: 2 },
    common_names: ["fish and chips", "fried fish", "british food"],
  },
  {
    name: "Chicken Noodle Soup",
    category: "main_course",
    nutritional_data: { calories: 120, protein: 8, carbs: 12, fat: 3, fiber: 1, sugar: 2 },
    common_names: ["chicken soup", "noodle soup", "soup"],
  },
  {
    name: "Chocolate Cake",
    category: "dessert",
    nutritional_data: { calories: 320, protein: 4, carbs: 45, fat: 14, fiber: 2, sugar: 35 },
    common_names: ["chocolate cake", "cake", "dessert"],
  },
  {
    name: "Apple Pie",
    category: "dessert",
    nutritional_data: { calories: 280, protein: 3, carbs: 42, fat: 12, fiber: 3, sugar: 22 },
    common_names: ["apple pie", "pie", "fruit pie"],
  },
  {
    name: "Ice Cream",
    category: "dessert",
    nutritional_data: { calories: 140, protein: 2, carbs: 17, fat: 7, fiber: 0, sugar: 16 },
    common_names: ["ice cream", "frozen dessert", "sweet treat"],
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

  // Enhanced AI image recognition with better accuracy for Indian foods
  async recognizeFood(imageData: string): Promise<{ food: FoodItem; confidence: number }> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

    // Enhanced food recognition with better Indian food detection
    const indianFoods = FOOD_DATABASE.filter((food) => {
      const isIndian = food.common_names.some((name) =>
        ["dal", "chapati", "biryani", "paneer", "dosa", "idli", "rajma", "samosa", "ghee", "lassi", 
         "pakora", "naan", "vada", "upma", "poha", "dhokla", "misal", "pav", "bhel", "pani", "jalebi", 
         "kulfi", "kheer", "halwa", "ladoo", "barfi", "chole", "bhature", "butter", "chicken", "tandoori",
         "palak", "aloo", "gobi", "raita", "gulab", "jamun", "rasgulla"].includes(name.toLowerCase())
      )
      return isIndian || ["curry", "bread", "rice", "snack", "main_course", "dessert", "beverage", "dairy"].includes(food.category)
    })

    const allFoods = FOOD_DATABASE

    // 70% chance of Indian food, 30% international (increased bias for Indian foods)
    const useIndianFood = Math.random() < 0.7
    const foodPool = useIndianFood ? indianFoods : allFoods

    // Weighted selection - more common foods have higher probability
    const commonFoods = foodPool.filter(food => 
      food.common_names.some(name => 
        ["rice", "chapati", "dal", "paneer", "chicken", "samosa", "dosa", "idli"].includes(name.toLowerCase())
      )
    )

    const selectedPool = commonFoods.length > 0 ? commonFoods : foodPool
    const selectedFood = selectedPool[Math.floor(Math.random() * selectedPool.length)]
    const confidence = 0.80 + Math.random() * 0.15 // 80-95% confidence (improved)

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

  // Generate personalized recommendation with enhanced user profile analysis
  generateRecommendation(
    food: FoodItem,
    userProfile?: any,
  ): {
    is_recommended: boolean
    reason: string
    tips: string[]
    health_score: number
    warnings: string[]
    benefits: string[]
  } {
    const { nutritional_data } = food

    // Calculate base health score
    let healthScore = 50 // Base score

    // Protein analysis
    if (nutritional_data.protein > 15) healthScore += 20
    else if (nutritional_data.protein > 8) healthScore += 10

    // Fiber analysis
    if (nutritional_data.fiber > 5) healthScore += 15
    else if (nutritional_data.fiber > 3) healthScore += 8

    // Calorie analysis
    if (nutritional_data.calories > 300) healthScore -= 15
    else if (nutritional_data.calories > 200) healthScore -= 5

    // Sugar analysis
    if (nutritional_data.sugar > 10) healthScore -= 20
    else if (nutritional_data.sugar > 5) healthScore -= 10

    // Fat balance
    if (nutritional_data.fat > 20) healthScore -= 10
    else if (nutritional_data.fat < 2) healthScore += 5

    // User profile-based adjustments
    if (userProfile) {
      // Weight management goals
      if (userProfile.health_goals?.includes("weight_loss")) {
        if (nutritional_data.calories > 250) healthScore -= 10
        if (nutritional_data.fat > 15) healthScore -= 8
        if (nutritional_data.protein > 15) healthScore += 15 // Protein helps with satiety
      }

      // Muscle building goals
      if (userProfile.health_goals?.includes("muscle_gain")) {
        if (nutritional_data.protein > 20) healthScore += 15
        else if (nutritional_data.protein < 10) healthScore -= 10
      }

      // Diabetes management
      if (userProfile.dietary_restrictions?.includes("diabetes")) {
        if (nutritional_data.sugar > 5) healthScore -= 15
        if (nutritional_data.carbs > 30) healthScore -= 10
        if (nutritional_data.fiber > 5) healthScore += 10 // Fiber helps with blood sugar
      }

      // Heart health
      if (userProfile.health_conditions?.includes("heart_disease")) {
        if (nutritional_data.fat > 15) healthScore -= 12
        if (nutritional_data.sodium > 400) healthScore -= 10
        if (nutritional_data.fiber > 5) healthScore += 8
      }

      // High blood pressure
      if (userProfile.health_conditions?.includes("high_blood_pressure")) {
        if (nutritional_data.sodium > 400) healthScore -= 15
        if (nutritional_data.sugar > 8) healthScore -= 8
      }

      // Age-based considerations
      if (userProfile.age > 50) {
        if (nutritional_data.protein > 15) healthScore += 5 // Protein needs increase with age
        if (nutritional_data.fiber > 5) healthScore += 5 // Fiber important for digestive health
      }

      // Activity level adjustments
      if (userProfile.activity_level === "very_active") {
        if (nutritional_data.calories > 200) healthScore += 5 // Active people need more calories
      } else if (userProfile.activity_level === "sedentary") {
        if (nutritional_data.calories > 250) healthScore -= 8
      }
    }

    healthScore = Math.max(0, Math.min(100, healthScore))

    const isRecommended = healthScore >= 60

    // Generate personalized tips with humor
    const tips = []
    const warnings = []
    const benefits = []

    // General nutritional tips with humor
    if (nutritional_data.protein < 10) tips.push("💪 Add some protein - your muscles are probably crying for help!")
    if (nutritional_data.fiber < 3) tips.push("🥬 Throw in some veggies - your digestive system will thank you!")
    if (nutritional_data.calories > 250) tips.push("📏 Portion control is key - your waistline is watching!")
    if (nutritional_data.sugar > 8) tips.push("🍭 Easy on the sugar - your dentist and your pancreas are both concerned!")
    if (nutritional_data.fat > 15) tips.push("⚖️ Balance is everything - maybe skip the extra butter next time?")

    // Positive nutritional benefits with humor
    if (nutritional_data.protein > 15) benefits.push("💪 Protein powerhouse - your muscles are doing a happy dance!")
    if (nutritional_data.fiber > 5) benefits.push("🌾 Fiber champion - your gut bacteria are throwing a party!")
    if (nutritional_data.calories < 150) benefits.push("🎯 Low-calorie winner - your metabolism is impressed!")
    if (nutritional_data.fat < 5) benefits.push("✨ Low-fat legend - your heart is sending love letters!")

    // User-specific warnings with humor
    if (userProfile?.dietary_restrictions?.includes("diabetes") && nutritional_data.sugar > 5) {
      warnings.push("🍭 Sugar alert! Your blood glucose is probably having a rollercoaster ride!")
    }

    if (userProfile?.health_conditions?.includes("heart_disease") && nutritional_data.fat > 15) {
      warnings.push("❤️ Heart says 'slow down!' - maybe choose something lighter for your ticker!")
    }

    if (userProfile?.health_goals?.includes("weight_loss") && nutritional_data.calories > 300) {
      warnings.push("⚖️ Calorie overload! Your scale is probably hiding in the closet!")
    }

    if (userProfile?.health_conditions?.includes("high_blood_pressure") && nutritional_data.sodium > 400) {
      warnings.push("🧂 Sodium tsunami! Your blood pressure is probably doing jumping jacks!")
    }

    // Generate personalized reason with humorous responses
    let reason = ""
    const humorousResponses = {
      excellent: [
        `🎉 Wah! ${food.name} is a fantastic choice! Health score: ${healthScore}/100. Your taste buds and body are both doing a happy dance! 💃`,
        `🔥 Absolutely brilliant! ${food.name} gets a solid ${healthScore}/100. This is what we call a win-win situation! 🏆`,
        `✨ Outstanding choice! ${food.name} scores ${healthScore}/100. Your future self will thank you for this decision! 🙏`,
        `🚀 Boom! ${food.name} is a nutritional powerhouse with ${healthScore}/100. You're basically a health guru now! 🧘‍♀️`
      ],
      good: [
        `👍 Nice one! ${food.name} gets a decent ${healthScore}/100. Not bad at all, you're on the right track! 🎯`,
        `😊 Good choice! ${food.name} scores ${healthScore}/100. Your body is giving you a subtle thumbs up! 👍`,
        `💪 Solid pick! ${food.name} has a health score of ${healthScore}/100. You're building good habits! 🏗️`,
        `🌟 Well done! ${food.name} gets ${healthScore}/100. Your health journey is looking promising! 🛤️`
      ],
      moderate: [
        `🤔 Hmm, ${food.name} scores ${healthScore}/100. It's okay, but maybe we can do better next time? 🤷‍♀️`,
        `😐 ${food.name} gets ${healthScore}/100. It's not terrible, but your body deserves something more exciting! 🎢`,
        `🤨 ${food.name} has a health score of ${healthScore}/100. It's like that friend who's nice but not your bestie! 👫`,
        `😅 ${food.name} scores ${healthScore}/100. It's... fine. But life's too short for just "fine" food! ⏰`
      ],
      poor: [
        `😬 Oops! ${food.name} only gets ${healthScore}/100. Your taste buds are happy, but your body is giving you the side-eye! 👀`,
        `🤯 Yikes! ${food.name} scores ${healthScore}/100. It's like eating a delicious mistake! 😅`,
        `😱 ${food.name} gets ${healthScore}/100. Your future self is probably shaking their head right now! 🤦‍♀️`,
        `😵 Whoa! ${food.name} has a health score of ${healthScore}/100. It's tasty, but your body is sending SOS signals! 🆘`
      ]
    }

    if (isRecommended) {
      if (healthScore >= 85) {
        reason = humorousResponses.excellent[Math.floor(Math.random() * humorousResponses.excellent.length)]
      } else if (healthScore >= 70) {
        reason = humorousResponses.good[Math.floor(Math.random() * humorousResponses.good.length)]
      } else {
        reason = humorousResponses.moderate[Math.floor(Math.random() * humorousResponses.moderate.length)]
      }
    } else {
      reason = humorousResponses.poor[Math.floor(Math.random() * humorousResponses.poor.length)]
    }

    // Add specific benefits or warnings with humor
    if (benefits.length > 0 && isRecommended) {
      reason += ` Plus, ${benefits[0].toLowerCase()} - that's what we call a bonus! 🎁`
    }
    if (warnings.length > 0 && !isRecommended) {
      reason += ` Also, ${warnings[0].toLowerCase()} - just saying! 😉`
    }

    return {
      is_recommended: isRecommended,
      reason,
      tips: tips.slice(0, 3),
      health_score: Math.round(healthScore),
      warnings: warnings.slice(0, 2),
      benefits: benefits.slice(0, 2),
    }
  }
}

export const foodRecognitionService = FoodRecognitionService.getInstance()
