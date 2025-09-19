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

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported in this browser. Please use a modern browser.")
        return
      }

      const constraints = {
        video: {
          facingMode: "environment", // Use back camera by default
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
      let errorMessage = "Unable to access camera. Please check permissions and try again."
      
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage = "Camera access denied. Please allow camera permissions and try again."
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found. Please connect a camera and try again."
        } else if (err.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application."
        }
      }
      
      setError(errorMessage)
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
      setAnalysisProgress(100)

      const { error: insertError } = await supabase.from("food_scans").insert({
        user_id: user.id,
        food_name: analysis.foodName,
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
      let errorMessage = "Failed to analyze image. Please try again."
      
      if (err instanceof Error) {
        if (err.message.includes("network")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (err.message.includes("API")) {
          errorMessage = "AI service temporarily unavailable. Please try again in a moment."
        } else if (err.message.includes("image")) {
          errorMessage = "Invalid image format. Please try with a different image."
        }
      }
      
      setError(errorMessage)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
      {/* Header */}
      <Header showBack backHref="/dashboard" title="AI Food Scanner" subtitle="Snap, analyze, discover!" />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Camera Preview Section */}
        <div className="mb-6">
          <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
            {capturedImage ? (
              // Captured image display
              <div className="relative w-full h-80">
                <img
                  src={capturedImage}
                  alt="Captured food"
                  className="w-full h-full object-cover"
                />
                
                {/* Grid overlay on captured image */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full relative">
                    <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/40"></div>
                    <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/40"></div>
                    <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/40"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/40"></div>
                  </div>
                </div>

                {/* Retake button overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    onClick={retakePhoto}
                    size="lg"
                    className="w-14 h-14 rounded-full bg-white hover:bg-white/90 text-black shadow-lg transition-all duration-200"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            ) : !isScanning ? (
              // Camera placeholder when not scanning
              <div className="w-full h-80 bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-lg font-medium">Camera Preview</p>
                    <p className="text-gray-500 text-sm">Start scanning to see live feed</p>
                  </div>
                </div>
              </div>
            ) : (
              // Live camera feed
              <div className="relative w-full h-80">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full relative">
                    {/* Vertical lines */}
                    <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/50"></div>
                    <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/50"></div>
                    {/* Horizontal lines */}
                    <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/50"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/50"></div>
                  </div>
                </div>

                {/* Camera controls overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white hover:bg-white/90 text-black shadow-lg transition-all duration-200 border-4 border-primary/20"
                  >
                    <Camera className="w-7 h-7" />
                  </Button>
                </div>

                {/* Instructions overlay */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Position food in center
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Camera Controls */}
        {!isScanning && (
          <div className="space-y-4 mb-6">
            <Button
              onClick={startCamera}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Camera Scanner
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
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20 mb-6">
            {error}
          </div>
        )}

        {/* Food Details Form */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Food Type Selection */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Food Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {FOOD_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedFoodTypes.includes(type.id) ? "default" : "outline"}
                  onClick={() => toggleFoodType(type.id)}
                  className="justify-start text-left transition-all duration-200"
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Cooking Method Selection */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">Cooking Method (multi-select)</h3>
            <div className="grid grid-cols-2 gap-2">
              {COOKING_METHODS.map((method) => (
                <Button
                  key={method.id}
                  variant={selectedCookingMethods.includes(method.id) ? "default" : "outline"}
                  onClick={() => toggleCookingMethod(method.id)}
                  className="justify-start text-left transition-all duration-200"
                >
                  <span className="mr-2">{method.icon}</span>
                  {method.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Oil Quantity Slider */}
          <div>
            <h3 className="text-foreground font-semibold mb-3">
              Oil / Butter Quantity: {oilQuantity[0] === 50 ? "Default / Normal Oil" : `${oilQuantity[0]}%`}
            </h3>
            <Slider 
              value={oilQuantity} 
              onValueChange={setOilQuantity} 
              max={100} 
              step={10} 
              className="w-full" 
            />
          </div>

          {/* Meal Details Input */}
          <div>
            <Input
              placeholder="Add meal details 'raw items'"
              value={mealDetails}
              onChange={(e) => setMealDetails(e.target.value)}
              className="transition-all duration-200"
            />
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-3 bg-accent p-4 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">AI analyzing food...</span>
                <span className="text-foreground font-bold">{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          {capturedImage && (
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={retakePhoto}
                variant="outline"
                disabled={isAnalyzing}
                className="flex-1 transition-all duration-200"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake
              </Button>

              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Capture & Analyse Meal
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )

}

function generatePersonalizedRecommendation(analysis: any, nutrition: any, profile: any) {
  // Import the enhanced recommendation system
  const { foodRecognitionService } = require("@/lib/food-recognition")
  
  // Create a food item object from the analysis and nutrition data
  const foodItem = {
    name: analysis.foodName,
    category: analysis.category || "other",
    nutritional_data: {
      calories: nutrition.calories || 200,
      protein: nutrition.protein || 10,
      carbs: nutrition.carbs || 30,
      fat: nutrition.fat || 8,
      fiber: nutrition.fiber || 3,
      sugar: nutrition.sugar || 5,
      sodium: nutrition.sodium || 300,
    }
  }

  // Use the enhanced recommendation system
  return foodRecognitionService.generateRecommendation(foodItem, profile)
}
