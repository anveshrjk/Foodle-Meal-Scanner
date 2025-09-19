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
  const [scanData, setScanData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadScanData = async () => {
      if (!foodName) return

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Get the most recent scan for this food
        const { data } = await supabase
          .from("food_scans")
          .select("*")
          .eq("user_id", user.id)
          .eq("food_name", foodName)
          .order("scanned_at", { ascending: false })
          .limit(1)
          .single()

        setScanData(data)
      } catch (error) {
        console.error("Error loading scan data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadScanData()
  }, [foodName, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 flex items-center justify-center">
        <div className="text-primary-foreground">Loading results...</div>
      </div>
    )
  }

  if (!foodName || !scanData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 flex items-center justify-center">
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center">
            <p className="text-primary-foreground mb-4">No scan results found</p>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Back to Dashboard 🏠</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
            <Badge
              variant={isRecommended ? "default" : "destructive"}
              className={`text-sm ${isRecommended ? "bg-green-600 dark:bg-green-700" : "bg-red-600 dark:bg-red-700"}`}
            >
              {isRecommended ? "✅ Perfect Choice!" : "⚠️ Consider Alternatives"}
            </Badge>
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
