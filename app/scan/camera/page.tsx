"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Camera, Upload, Loader2, ArrowLeft, RotateCcw, X, Check } from "lucide-react"
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
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

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
      setCameraError(null)
      console.log("Starting camera...")

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported in this browser. Please use a modern browser.")
        return
      }

      // Check if we're on HTTPS or localhost (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        setCameraError("Camera access requires HTTPS. Please use the secure version of the site.")
        return
      }

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      // Show camera immediately
      setShowCamera(true)
      setIsScanning(true)

      const constraints = {
        video: {
          facingMode: "environment", // Use back camera by default
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("Camera stream obtained:", mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        
        // Wait for video to be ready and play
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Video play failed:", err)
              setCameraError("Failed to start camera preview.")
            })
          }
        }
        
        console.log("Camera started successfully")
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
        } else if (err.name === "OverconstrainedError") {
          errorMessage = "Camera doesn't support the required settings. Trying with basic settings..."
          // Try with basic constraints as fallback
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream
              setStream(basicStream)
              setCameraError(null)
              
              videoRef.current.onloadedmetadata = () => {
                if (videoRef.current) {
                  videoRef.current.play().catch(fallbackPlayErr => {
                    console.error("Fallback video play failed:", fallbackPlayErr)
                    setCameraError("Failed to start camera preview.")
                  })
                }
              }
              return
            }
          } catch (fallbackErr) {
            console.error("Fallback camera access failed:", fallbackErr)
          }
        }
      }
      
      setCameraError(errorMessage)
      setShowCamera(false)
      setIsScanning(false)
    }
  }, [stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
    setShowCamera(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) {
      console.error("Could not get canvas context")
      return
    }

    // Set canvas dimensions to match video dimensions
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64 image
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
    
    if (imageDataUrl && imageDataUrl.startsWith("data:image/jpeg;base64,")) {
      setCapturedImage(imageDataUrl)
      stopCamera()
      console.log("Photo captured successfully")
    } else {
      setError("Failed to capture image. Please try again.")
    }
  }, [stopCamera])


  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, etc.)")
      return
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large. Please select an image smaller than 10MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result && result.startsWith("data:image/")) {
        setCapturedImage(result)
        setError(null)
      } else {
        setError("Failed to read image file. Please try again.")
      }
    }
    reader.onerror = () => {
      setError("Failed to read image file. Please try again.")
    }
    reader.readAsDataURL(file)
    
    // Clear the input so the same file can be selected again
    event.target.value = ""
  }, [])

  const analyzeImage = useCallback(async () => {
    if (!capturedImage) {
      setError("No image captured. Please take a photo first.")
      return
    }

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

      // Validate image format before sending
      if (!capturedImage.startsWith("data:image/")) {
        throw new Error("Invalid image format. Please capture or upload a valid image.")
      }

      console.log("Starting comprehensive food analysis...")

      // Step 1: Clarifai AI Recognition
      setAnalysisProgress(10)
      const clarifaiResponse = await fetch("/api/clarifai-recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      })

      let clarifaiData = null
      if (clarifaiResponse.ok) {
        clarifaiData = await clarifaiResponse.json()
        console.log("Clarifai recognition:", clarifaiData)
      }

      // Step 2: Open Food Facts API
      setAnalysisProgress(30)
      const foodName = clarifaiData?.primaryFood?.name || "unknown food"
      const openFoodFactsResponse = await fetch("/api/openfoodfacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName }),
      })

      let openFoodFactsData = null
      if (openFoodFactsResponse.ok) {
        openFoodFactsData = await openFoodFactsResponse.json()
        console.log("Open Food Facts data:", openFoodFactsData)
      }

      // Step 3: Edamam Nutrition API
      setAnalysisProgress(50)
      const edamamResponse = await fetch("/api/edamam-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          foodName,
          image: capturedImage 
        }),
      })

      let edamamData = null
      if (edamamResponse.ok) {
        edamamData = await edamamResponse.json()
        console.log("Edamam nutrition data:", edamamData)
      }

      // Step 4: Get user profile
      setAnalysisProgress(70)
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      // Step 5: Verdict Engine
      setAnalysisProgress(80)
      const verdictResponse = await fetch("/api/verdict-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName,
          clarifaiData,
          openFoodFactsData,
          edamamData,
          userProfile: profile
        }),
      })

      if (!verdictResponse.ok) {
        throw new Error("Failed to generate verdict")
      }

      const verdictResult = await verdictResponse.json()
      console.log("Verdict result:", verdictResult)
      setAnalysisProgress(100)

      // Save to database
      const { error: insertError } = await supabase.from("food_scans").insert({
        user_id: user.id,
        food_name: verdictResult.food_name,
        scan_type: "camera",
        image_url: capturedImage,
        nutritional_data: verdictResult.nutritional_data,
        recommendation: verdictResult.verdict,
        is_recommended: verdictResult.verdict.is_recommended,
        confidence: Math.round(verdictResult.confidence.clarifai * 100),
        food_types: selectedFoodTypes,
        cooking_methods: selectedCookingMethods,
        oil_quantity: oilQuantity[0],
        meal_details: mealDetails,
        health_score: verdictResult.health_score,
        humorous_response: verdictResult.humorous_response
      })

      if (insertError) throw insertError

      // Navigate to results with comprehensive data
      const resultParams = new URLSearchParams({
        food: verdictResult.food_name,
        recommended: verdictResult.verdict.is_recommended.toString(),
        healthScore: verdictResult.health_score.toString(),
        confidence: Math.round(verdictResult.confidence.clarifai * 100).toString()
      })

      router.push(`/scan/results?${resultParams.toString()}`)

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
    setCameraError(null)
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
        {/* Camera Preview Section - Like Snapchat/Instagram */}
        <div className="mb-6">
          <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
            {capturedImage ? (
              // Captured image display with action buttons
              <div className="relative w-full h-80">
                <img
                  src={capturedImage}
                  alt="Captured food"
                  className="w-full h-full object-cover"
                />
                
                {/* Grid overlay on captured image */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full relative">
                    {/* 3x3 Grid lines */}
                    <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/50"></div>
                    <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/50"></div>
                    <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/50"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/50"></div>
                    
                    {/* Corner brackets */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/70"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/70"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/70"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/70"></div>
                  </div>
                </div>

                {/* Action buttons overlay - Like Snapchat */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <Button
                    onClick={retakePhoto}
                    size="lg"
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    size="lg"
                    className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-200"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Check className="w-6 h-6" />
                    )}
                  </Button>
                </div>
              </div>
            ) : showCamera ? (
              // Live camera feed - Like Instagram/Snapchat
              <div className="relative w-full h-80">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                
                {/* Grid overlay for framing */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full relative">
                    {/* 3x3 Grid lines */}
                    <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/50"></div>
                    <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/50"></div>
                    <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/50"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/50"></div>
                    
                    {/* Corner brackets */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/70"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/70"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/70"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/70"></div>
                  </div>
                </div>

                {/* Camera controls overlay - Like Snapchat */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <Button
                    onClick={stopCamera}
                    size="lg"
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="w-20 h-20 rounded-full bg-white hover:bg-white/90 text-black shadow-lg transition-all duration-200 border-4 border-gray-300"
                  >
                    <Camera className="w-8 h-8" />
                  </Button>
                </div>

                        {/* Instructions overlay */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                    📸 Position food in center and tap to capture
                  </div>
                </div>

                {/* Debug info */}
                <div className="absolute top-16 left-4">
                  <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                    Camera: {showCamera ? 'ON' : 'OFF'} | Video: {videoRef.current?.readyState || 'N/A'}
                  </div>
                </div>
              </div>
            ) : isScanning && !showCamera ? (
              // Loading state when starting camera
              <div className="w-full h-80 bg-gray-800 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-lg font-medium">Starting Camera...</p>
                    <p className="text-gray-500 text-sm">Please allow camera permissions</p>
                  </div>
                </div>
              </div>
            ) : (
              // Camera placeholder - Show this when camera is not active
              <div className="w-full h-80 bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-lg font-medium">Camera Preview</p>
                    <p className="text-gray-500 text-sm">Tap "Snap Your Meal" to start camera</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Camera Controls - Always show when no image captured */}
        {!capturedImage && (
          <div className="space-y-4 mb-6">
            <Button
              onClick={startCamera}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Snap Your Meal
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
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Error Messages */}
        {(error || cameraError) && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20 mb-6">
            {error || cameraError}
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
