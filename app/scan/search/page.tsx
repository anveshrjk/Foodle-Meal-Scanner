"use client"

import type React from "react"
import { foodRecognitionService } from "@/lib/food-recognition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

// Mock food database
const mockFoodDatabase = [
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Grilled Chicken Breast", calories: 231, protein: 43.5, carbs: 0, fat: 5 },
  { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
  { name: "Broccoli", calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  { name: "Salmon Fillet", calories: 206, protein: 22, carbs: 0, fat: 12 },
  { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0.7 },
  { name: "Avocado", calories: 234, protein: 2.9, carbs: 12, fat: 21 },
  { name: "Quinoa", calories: 222, protein: 8, carbs: 39, fat: 3.6 },
  { name: "Sweet Potato", calories: 112, protein: 2, carbs: 26, fat: 0.1 },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const results = foodRecognitionService.searchFood(searchQuery)
      setSearchResults(
        results.map((food) => ({
          name: food.name,
          calories: food.nutritional_data.calories,
          protein: food.nutritional_data.protein,
          carbs: food.nutritional_data.carbs,
          fat: food.nutritional_data.fat,
        })),
      )
    } catch (err) {
      console.error("Search error:", err)
      setError("Failed to search foods. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  const analyzeFood = useCallback(
    async (food: any) => {
      setIsAnalyzing(true)
      setError(null)

      try {
        // Get current user
        const {
          data: { user },
        } = await window.supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        // Get user profile for personalized recommendation
        const { data: profile } = await window.supabase.from("profiles").select("*").eq("id", user.id).single()

        const foodItem = {
          name: food.name,
          category: "general",
          nutritional_data: food,
          common_names: [food.name.toLowerCase()],
        }
        const recommendation = foodRecognitionService.generateRecommendation(foodItem, profile)

        // Save scan to database
        const { error: insertError } = await window.supabase.from("food_scans").insert({
          user_id: user.id,
          food_name: food.name,
          scan_type: "search",
          nutritional_data: food,
          recommendation: recommendation,
          is_recommended: recommendation.is_recommended,
        })

        if (insertError) throw insertError

        // Redirect to results page
        router.push(`/scan/results?food=${encodeURIComponent(food.name)}&recommended=${recommendation.is_recommended}`)
      } catch (err) {
        console.error("Error analyzing food:", err)
        setError("Failed to analyze food. Please try again.")
      } finally {
        setIsAnalyzing(false)
      }
    },
    [router],
  )

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-emerald-200 dark:border-emerald-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">Food Search</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900">
          <CardHeader className="text-center">
            <CardTitle className="text-emerald-800 dark:text-emerald-200">Search Food Database</CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-400">
              Find nutritional information and get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {/* Search Input */}
            <div className="flex space-x-3">
              <Input
                placeholder="Search for food (e.g., dal, biryani, chicken, rice...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-6"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Search Results</h3>
                <div className="grid gap-4">
                  {searchResults.map((food, index) => (
                    <Card
                      key={index}
                      className="border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">{food.name}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-emerald-600 dark:text-emerald-400">
                              <div>
                                <span className="font-medium">Calories:</span> {food.calories}
                              </div>
                              <div>
                                <span className="font-medium">Protein:</span> {food.protein}g
                              </div>
                              <div>
                                <span className="font-medium">Carbs:</span> {food.carbs}g
                              </div>
                              <div>
                                <span className="font-medium">Fat:</span> {food.fat}g
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => analyzeFood(food)}
                            disabled={isAnalyzing}
                            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white ml-4"
                          >
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <p className="text-emerald-600 dark:text-emerald-400">No foods found matching "{searchQuery}"</p>
                <p className="text-sm text-emerald-500 dark:text-emerald-500 mt-2">
                  Try searching for Indian dishes like dal, biryani, or common foods like chicken, rice
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Foods */}
        <Card className="mt-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
          <CardHeader>
            <CardTitle className="text-emerald-800 dark:text-emerald-200">Popular Indian Foods</CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-400">
              Quick access to commonly searched foods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Dal Tadka", "Biryani", "Paneer", "Chapati", "Dosa", "Chicken Curry", "Rajma", "Samosa"].map((food) => (
                <Button
                  key={food}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(food)
                    handleSearch()
                  }}
                  className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                >
                  {food}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
