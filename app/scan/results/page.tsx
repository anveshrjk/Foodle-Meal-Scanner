"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, Home, Camera } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-emerald-600">Loading results...</div>
      </div>
    )
  }

  if (!foodName || !scanData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <Card className="border-emerald-200">
          <CardContent className="p-8 text-center">
            <p className="text-emerald-600 mb-4">No scan results found</p>
            <Link href="/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nutritionalData = scanData.nutritional_data
  const recommendation = scanData.recommendation

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-emerald-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-emerald-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-emerald-800">Scan Results</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Food Name and Recommendation Status */}
        <Card
          className={`border-2 mb-6 ${isRecommended ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              {isRecommended ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <CardTitle className="text-2xl text-emerald-800">{foodName}</CardTitle>
            </div>
            <Badge
              variant={isRecommended ? "default" : "destructive"}
              className={`text-sm ${isRecommended ? "bg-green-600" : "bg-red-600"}`}
            >
              {isRecommended ? "Recommended for You" : "Not Recommended"}
            </Badge>
            <CardDescription className="text-emerald-700 mt-2 capitalize">
              Scanned via {scanData.scan_type}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Nutritional Information */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Nutritional Information</CardTitle>
              <CardDescription className="text-emerald-600">Per serving nutritional breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-800">{nutritionalData.calories}</div>
                  <div className="text-sm text-emerald-600">Calories</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-800">{nutritionalData.protein}g</div>
                  <div className="text-sm text-emerald-600">Protein</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-800">{nutritionalData.carbs}g</div>
                  <div className="text-sm text-emerald-600">Carbs</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-800">{nutritionalData.fat}g</div>
                  <div className="text-sm text-emerald-600">Fat</div>
                </div>
                {nutritionalData.fiber && (
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-800">{nutritionalData.fiber}g</div>
                    <div className="text-sm text-emerald-600">Fiber</div>
                  </div>
                )}
                {nutritionalData.sugar && (
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-800">{nutritionalData.sugar}g</div>
                    <div className="text-sm text-emerald-600">Sugar</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                AI Recommendation
              </CardTitle>
              <CardDescription className="text-emerald-600">
                Personalized advice based on your health profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`p-4 rounded-lg ${isRecommended ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <p className={`text-sm ${isRecommended ? "text-green-800" : "text-red-800"}`}>
                  {recommendation.reason}
                </p>
              </div>

              {recommendation.tips && recommendation.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-800 mb-2">Health Tips</h4>
                  <ul className="space-y-2">
                    {recommendation.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-emerald-700">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
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
          <Card className="mt-6 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Scanned Image</CardTitle>
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
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/scan/camera" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Scan Another Food
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
