"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Camera, Upload, Loader2, ArrowLeft, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"

const FOOD_TYPES = [
  { id: "home_made", label: "Home Made", icon: "🏠" },
  { id: "packaged", label: "Packaged Food", icon: "📦" },
  { id: "restaurant", label: "Restaurant / Cafe", icon: "🍽️" },
  { id: "hostel", label: "Hostel", icon: "🍪" },
  { id: "street", label: "Street Food", icon: "🌮" },
  { id: "supplements", label: "Supplements", icon: "💊" },
]

const COOKING_METHODS = [
  { id: "not_sure", label: "Not Sure", icon: "❓" },
  { id: "mixed", label: "Mixed", icon: "🍲" },
  { id: "air_fried", label: "Air-fried", icon: "🌪️" },
  { id: "boiled", label: "Boiled", icon: "💧" },
  { id: "oven_baked", label: "Oven-baked", icon: "🔥" },
  { id: "raw", label: "Raw", icon: "🥗" },
  { id: "stir_fried", label: "Stir-fried", icon: "🥢" },
  { id: "roasted", label: "Roasted", icon: "🔥" },
]

export default function CameraScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Form state
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([])
  const [selectedCookingMethods, setSelectedCookingMethods] = useState<string[]>([])
  const [oilQuantity, setOilQuantity] = useState([50])
  const [mealDetails, setMealDetails] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnalyzing) {
      setAnalysisProgress(0)
      interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 200)
    }
    return () => clearInterval(interval)
  }, [isAnalyzing])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startCamera = useCallback(async () => {
    try {
      setError(null)

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 4 / 3 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions and try again.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95)
    setCapturedImage(imageDataUrl)
    stopCamera()
  }, [stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setCapturedImage(result)
      setError(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const analysisResponse = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          foodTypes: selectedFoodTypes,
          cookingMethods: selectedCookingMethods,
          oilQuantity: oilQuantity[0],
          mealDetails,
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze food image")
      }

      const { analysis } = await analysisResponse.json()
      setAnalysisProgress(50)

<<<<<<< HEAD
      // First, try matching against our internal database for higher accuracy
      const matchResponse = await fetch("/api/match-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName: analysis.foodName, description: analysis.description }),
      })

      let nutrition
      let matchedName = analysis.foodName
      if (matchResponse.ok) {
        const match = await matchResponse.json()
        if (match?.match?.nutritional_data) {
          nutrition = match.match.nutritional_data
          matchedName = match.match.name || matchedName
        }
      }

      // If internal match not found, use external nutrition lookup
      if (!nutrition) {
        const nutritionResponse = await fetch("/api/get-nutrition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            foodName: analysis.foodName,
            description: analysis.description,
          }),
        })

        if (!nutritionResponse.ok) {
          throw new Error("Failed to get nutrition data")
        }

        const nutritionJson = await nutritionResponse.json()
        nutrition = nutritionJson.nutrition
      }
      setAnalysisProgress(80)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      const recommendation = generatePersonalizedRecommendation({ ...analysis, foodName: matchedName }, nutrition, profile)
=======
      const nutritionResponse = await fetch("/api/get-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: analysis.foodName,
          description: analysis.description,
        }),
      })

      if (!nutritionResponse.ok) {
        throw new Error("Failed to get nutrition data")
      }

      const { nutrition } = await nutritionResponse.json()
      setAnalysisProgress(80)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      const recommendation = generatePersonalizedRecommendation(analysis, nutrition, profile)
>>>>>>> 5fc23ca2467bb567130c3c0a35d1d6c541b39ba7
      setAnalysisProgress(100)

      const { error: insertError } = await supabase.from("food_scans").insert({
        user_id: user.id,
<<<<<<< HEAD
        food_name: matchedName,
=======
        food_name: analysis.foodName,
>>>>>>> 5fc23ca2467bb567130c3c0a35d1d6c541b39ba7
        scan_type: "camera",
        image_url: capturedImage,
        nutritional_data: nutrition,
        recommendation: recommendation,
        is_recommended: recommendation.is_recommended,
        confidence: Math.round(analysis.confidence * 100),
        food_types: selectedFoodTypes,
        cooking_methods: selectedCookingMethods,
        oil_quantity: oilQuantity[0],
        meal_details: mealDetails,
      })

      if (insertError) throw insertError

      router.push(
        `/scan/results?food=${encodeURIComponent(analysis.foodName)}&recommended=${recommendation.is_recommended}&confidence=${Math.round(analysis.confidence * 100)}`,
      )
    } catch (err) {
      console.error("Error analyzing image:", err)
      setError("Failed to analyze image. Please try again.")
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }, [capturedImage, supabase, router, selectedFoodTypes, selectedCookingMethods, oilQuantity, mealDetails])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setError(null)
    startCamera()
  }, [startCamera])

  const toggleFoodType = (typeId: string) => {
    setSelectedFoodTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const toggleCookingMethod = (methodId: string) => {
    setSelectedCookingMethods((prev) =>
      prev.includes(methodId) ? prev.filter((id) => id !== methodId) : [...prev, methodId],
    )
  }

  if (!capturedImage && !isScanning) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header showBack backHref="/dashboard" title="AI Food Scanner" subtitle="Snap, analyze, discover!" />

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Decode Your Food?</h2>
              <p className="text-muted-foreground">Point, shoot, and let AI reveal the secrets of your meal!</p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={startCamera}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Launch Food Scanner
              </Button>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-border text-foreground hover:bg-accent transition-all duration-200"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload from Gallery
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isScanning) {
    return (
      <div className="min-h-screen bg-black">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={stopCamera}
            className="text-white hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative w-full h-screen">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full relative">
              {/* Vertical lines */}
              <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/40"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/40"></div>
              {/* Horizontal lines */}
              <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/40"></div>
              <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/40"></div>
            </div>
          </div>

<<<<<<< HEAD
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
            <Button
              onClick={capturePhoto}
              size="lg"
              className="rounded-full bg-white hover:bg-white/90 text-black shadow-lg transition-all duration-200 px-6 h-12"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture & Analyze Meal
=======
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <Button
              onClick={capturePhoto}
              size="lg"
              className="w-16 h-16 rounded-full bg-white hover:bg-white/90 text-black shadow-lg transition-all duration-200"
            >
              <Camera className="w-6 h-6" />
>>>>>>> 5fc23ca2467bb567130c3c0a35d1d6c541b39ba7
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={retakePhoto}
          className="text-white hover:bg-white/20 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-4 pb-4 space-y-6">
        <div className="relative">
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured food"
            className="w-full rounded-lg object-cover"
            style={{ aspectRatio: "4/3" }}
          />
          {/* Grid overlay on captured image */}
          <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/30"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/30"></div>
              <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/30"></div>
              <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/30"></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Food Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {FOOD_TYPES.map((type) => (
              <Button
                key={type.id}
                variant={selectedFoodTypes.includes(type.id) ? "default" : "outline"}
                onClick={() => toggleFoodType(type.id)}
                className={`justify-start text-left transition-all duration-200 ${
                  selectedFoodTypes.includes(type.id)
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-transparent border-gray-600 text-white hover:bg-white/10"
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Cooking Method (multi-select)</h3>
          <div className="grid grid-cols-2 gap-2">
            {COOKING_METHODS.map((method) => (
              <Button
                key={method.id}
                variant={selectedCookingMethods.includes(method.id) ? "default" : "outline"}
                onClick={() => toggleCookingMethod(method.id)}
                className={`justify-start text-left transition-all duration-200 ${
                  selectedCookingMethods.includes(method.id)
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-transparent border-gray-600 text-white hover:bg-white/10"
                }`}
              >
                <span className="mr-2">{method.icon}</span>
                {method.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">
            Oil / Butter Quantity: {oilQuantity[0] === 50 ? "Default / Normal Oil" : `${oilQuantity[0]}%`}
          </h3>
          <Slider value={oilQuantity} onValueChange={setOilQuantity} max={100} step={10} className="w-full" />
        </div>

        <div>
          <Input
            placeholder="Add meal details 'raw items'"
            value={mealDetails}
            onChange={(e) => setMealDetails(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 transition-all duration-200"
          />
        </div>

        {isAnalyzing && (
          <div className="space-y-3 bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-medium">AI analyzing food...</span>
              <span className="text-white font-bold">{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-800">{error}</div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={retakePhoto}
            variant="outline"
            disabled={isAnalyzing}
            className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 transition-all duration-200"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retake
          </Button>

          <Button
            onClick={analyzeImage}
            disabled={isAnalyzing}
            className="flex-1 bg-white text-black hover:bg-white/90 transition-all duration-200"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
<<<<<<< HEAD
              "Capture & Analyze Meal"
=======
              "Continue →"
>>>>>>> 5fc23ca2467bb567130c3c0a35d1d6c541b39ba7
            )}
          </Button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

function generatePersonalizedRecommendation(analysis: any, nutrition: any, profile: any) {
  const healthScore = nutrition.healthScore || 5
  const isRecommended = healthScore >= 6

  const tips = nutrition.healthTips || []

  if (profile?.health_goals?.includes("weight_loss") && nutrition.calories > 300) {
    tips.push("Consider a smaller portion for weight management")
  }

  if (profile?.dietary_restrictions?.includes("diabetes") && nutrition.sugar > 10) {
    tips.push("Monitor blood sugar levels due to high sugar content")
  }

  return {
    is_recommended: isRecommended,
    health_score: healthScore,
    tips: tips,
    reason: isRecommended
      ? `Great choice! This ${analysis.foodName} has good nutritional value.`
      : `Consider healthier alternatives to this ${analysis.foodName}.`,
  }
}
