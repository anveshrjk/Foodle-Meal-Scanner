"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Lightbulb, Home, Camera } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const foodName = searchParams.get("food")
  const isRecommended = searchParams.get("recommended") === "true"
  const healthScore = searchParams.get("healthScore")
  const confidence = searchParams.get("confidence")
  const [scanData, setScanData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadScanData = async () => {
      if (!foodName) {
        setIsLoading(false)
        return
      }

      try {
        // First try to get data from URL parameters (immediate display)
        const urlData = {
          food_name: foodName,
          is_recommended: isRecommended,
          health_score: healthScore,
          confidence: confidence,
          scan_type: "camera",
          nutritional_data: {
            calories: searchParams.get("calories") || "0",
            protein: searchParams.get("protein") || "0",
            carbs: searchParams.get("carbs") || "0",
            fat: searchParams.get("fat") || "0",
            fiber: searchParams.get("fiber") || "0",
            sugar: searchParams.get("sugar") || "0"
          },
          recommendation: {
            reason: searchParams.get("reason") || "Analysis completed successfully",
            health_score: healthScore,
            is_recommended: isRecommended
          },
          humorous_response: searchParams.get("humorous") || "Great choice! Your food has been analyzed with AI precision! 🤖"
        }

        setScanData(urlData)
        setIsLoading(false)

        // Then try to get more detailed data from database if available
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            const { data } = await supabase
              .from("food_scans")
              .select("*")
              .eq("user_id", user.id)
              .eq("food_name", foodName)
              .order("scanned_at", { ascending: false })
              .limit(1)
              .single()

            if (data) {
              setScanData(data) // Update with database data if available
            }
          }
        } catch (dbError) {
          console.log("No database data available, using URL data")
        }
      } catch (error) {
        console.error("Error loading scan data:", error)
        setIsLoading(false)
      }
    }

    loadScanData()
  }, [foodName, isRecommended, healthScore, confidence, searchParams, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
        <Header showBack backHref="/dashboard" title="Loading Results" subtitle="Processing your food analysis..." />
        
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Your Food</h3>
                <p className="text-muted-foreground">
                  {foodName ? `Processing data for ${foodName}...` : "Loading analysis results..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!foodName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 flex items-center justify-center">
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center">
            <p className="text-primary-foreground mb-4">No food name provided</p>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Back to Dashboard 🏠</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no scanData but we have foodName, create fallback data
  if (!scanData) {
    const fallbackData = {
      food_name: foodName,
      is_recommended: isRecommended,
      health_score: healthScore,
      confidence: confidence,
      scan_type: "camera",
      nutritional_data: {
        calories: searchParams.get("calories") || "200",
        protein: searchParams.get("protein") || "10",
        carbs: searchParams.get("carbs") || "30",
        fat: searchParams.get("fat") || "5",
        fiber: searchParams.get("fiber") || "3",
        sugar: searchParams.get("sugar") || "5"
      },
      recommendation: {
        reason: searchParams.get("reason") || "Analysis completed successfully",
        health_score: healthScore,
        is_recommended: isRecommended
      },
      humorous_response: searchParams.get("humorous") || "Great choice! Your food has been analyzed with AI precision! 🤖"
    }
    setScanData(fallbackData)
  }

  const nutritionalData = scanData.nutritional_data
  const recommendation = scanData.recommendation

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
      {/* Header */}
      <Header showBack backHref="/dashboard" title="Scan Results" subtitle="Your food's health report! 📊" />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Food Name and Recommendation Status */}
        <Card
          className={`border-2 mb-6 ${isRecommended ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950" : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"}`}
        >
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              {isRecommended ? (
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              )}
              <CardTitle className="text-2xl text-foreground">{foodName}</CardTitle>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <Badge
                variant={isRecommended ? "default" : "destructive"}
                className={`text-sm ${isRecommended ? "bg-green-600 dark:bg-green-700" : "bg-red-600 dark:bg-red-700"}`}
              >
                {isRecommended ? "✅ Perfect Choice!" : "⚠️ Consider Alternatives"}
              </Badge>
              
              {(healthScore || recommendation.health_score) && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Health Score:</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    (parseInt(healthScore || recommendation.health_score) >= 80) ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                    (parseInt(healthScore || recommendation.health_score) >= 60) ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {healthScore || recommendation.health_score}/100
                  </div>
                </div>
              )}
            </div>
            <CardDescription className="text-muted-foreground mt-2 capitalize">
              Analyzed via {scanData.scan_type} • AI Confidence: {scanData.confidence || 95}%
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Nutritional Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">📊 Nutritional Breakdown</CardTitle>
              <CardDescription className="text-muted-foreground">Per serving nutritional analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{nutritionalData.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{nutritionalData.protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{nutritionalData.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{nutritionalData.fat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
                {nutritionalData.fiber && (
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{nutritionalData.fiber}g</div>
                    <div className="text-sm text-muted-foreground">Fiber</div>
                  </div>
                )}
                {nutritionalData.sugar && (
                  <div className="text-center p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{nutritionalData.sugar}g</div>
                    <div className="text-sm text-muted-foreground">Sugar</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />🤖 AI Insights
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Personalized advice crafted just for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Humorous Response */}
              {scanData.humorous_response && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    {scanData.humorous_response}
                  </p>
                </div>
              )}

              <div
                className={`p-4 rounded-lg ${isRecommended ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"}`}
              >
                <p
                  className={`text-sm ${isRecommended ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}
                >
                  {recommendation.reason}
                </p>
              </div>

              {recommendation.tips && recommendation.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">💡 Smart Tips</h4>
                  <ul className="space-y-2">
                    {recommendation.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.warnings && recommendation.warnings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ Important Warnings</h4>
                  <ul className="space-y-2">
                    {recommendation.warnings.map((warning: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-red-700 dark:text-red-400">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.benefits && recommendation.benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✨ Health Benefits</h4>
                  <ul className="space-y-2">
                    {recommendation.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-green-700 dark:text-green-400">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Image Display (if available) */}
        {scanData.image_url && (
          <Card className="mt-6 border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Scanned Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={scanData.image_url || "/placeholder.svg"}
                alt={foodName}
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </CardContent>
          </Card>
        )}

        {/* Debug Information (only show in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">🔍 Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div><strong>Food Name:</strong> {foodName}</div>
                <div><strong>Is Recommended:</strong> {isRecommended ? 'Yes' : 'No'}</div>
                <div><strong>Health Score:</strong> {healthScore}</div>
                <div><strong>Calories:</strong> {nutritionalData?.calories || 'N/A'}</div>
                <div><strong>Protein:</strong> {nutritionalData?.protein || 'N/A'}g</div>
                <div><strong>Carbs:</strong> {nutritionalData?.carbs || 'N/A'}g</div>
                <div><strong>Fat:</strong> {nutritionalData?.fat || 'N/A'}g</div>
                <div><strong>Reason:</strong> {recommendation?.reason || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard 🏠
            </Button>
          </Link>
          <Link href="/scan/camera" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Scan Another Food 📸
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
