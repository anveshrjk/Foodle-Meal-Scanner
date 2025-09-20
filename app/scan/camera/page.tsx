"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Loader2, ArrowLeft, RotateCcw, X, Check, CheckCircle, XCircle } from "lucide-react"
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
  
  // Analysis state management
  const [analysisStep, setAnalysisStep] = useState<string>("")
  const [identifiedFoods, setIdentifiedFoods] = useState<string[]>([])
  const [nutritionalData, setNutritionalData] = useState<any>(null)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  
  // Manual input state for when AI fails
  const [showManualInputModal, setShowManualInputModal] = useState(false)
  const [manualFoodName, setManualFoodName] = useState("")
  const [isManualInputLoading, setIsManualInputLoading] = useState(false)

  // Debug: Log modal state changes
  useEffect(() => {
    console.log("🔍 showManualInputModal state changed:", showManualInputModal)
  }, [showManualInputModal])

  // Debug: Test function to force show modal
  const testManualInputModal = useCallback(() => {
    console.log("🔍 Testing manual input modal - current state:", showManualInputModal)
    setShowManualInputModal(true)
    console.log("🔍 Set showManualInputModal to true")
  }, [showManualInputModal])

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

  // Step 1: Image-to-Data (Food Recognition)
  const recognizeFoodItems = useCallback(async (imageData: string): Promise<string[]> => {
    try {
      console.log("Step 1: Starting food recognition...")
      setAnalysisStep("🔍 Recognizing food items...")
      setAnalysisProgress(10)
      
      const clarifaiResponse = await fetch("/api/clarifai-recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      })

      const clarifaiData = await clarifaiResponse.json()
      console.log("🔍 Clarifai API Response:", clarifaiData)
      console.log("🔍 Clarifai success status:", clarifaiData.success)
      console.log("🔍 Clarifai food items:", clarifaiData.foodItems)
      console.log("🔍 Clarifai concepts:", clarifaiData.concepts)

      // Check if the response indicates no food items were detected
      if (!clarifaiResponse.ok || (clarifaiData.error && clarifaiData.error.includes("No food items detected"))) {
        console.warn("🔍 No food items detected by Clarifai, showing manual input modal")
        console.warn("🔍 Response status:", clarifaiResponse.status)
        console.warn("🔍 Response ok:", clarifaiResponse.ok)
        console.warn("🔍 Error message:", clarifaiData.error)
        setShowManualInputModal(true)
        return [] // Return empty array to trigger manual input
      }

      // Check if it's an API configuration issue
      if (!clarifaiResponse.ok && clarifaiResponse.status === 500 && clarifaiData.error?.includes("not configured")) {
        console.warn("Clarifai API not configured, showing manual input modal")
        setShowManualInputModal(true)
        return [] // Return empty array to trigger manual input
      }

      // Extract food items from Clarifai response
      const foodItems: string[] = []
      
      console.log("🔍 Processing Clarifai food items...")
      if (clarifaiData.foodItems && clarifaiData.foodItems.length > 0) {
        console.log("🔍 Found food items in response:", clarifaiData.foodItems.length)
        clarifaiData.foodItems.forEach((item: any, index: number) => {
          console.log(`🔍 Item ${index + 1}:`, item.name, "confidence:", item.confidence)
          if (item.confidence > 0.2) { // Lower confidence threshold
            foodItems.push(item.name)
            console.log("🔍 Added to food items:", item.name)
          } else {
            console.log("🔍 Skipped item (low confidence):", item.name, "confidence:", item.confidence)
          }
        })
      } else {
        console.log("🔍 No food items found in Clarifai response")
      }

      // If no items found, use the primary food name
      if (foodItems.length === 0 && clarifaiData.primaryFood?.name) {
        console.log("🔍 Using primary food name:", clarifaiData.primaryFood.name)
        foodItems.push(clarifaiData.primaryFood.name)
      }

      // Final fallback if still no items
      if (foodItems.length === 0) {
        console.warn("🔍 No food items identified, showing manual input modal")
        setShowManualInputModal(true)
        return [] // Return empty array to trigger manual input
      }

      console.log("🔍 Final identified food items:", foodItems)
      setIdentifiedFoods(foodItems)
      return foodItems

    } catch (error) {
      console.error("Food recognition error:", error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Show manual input modal instead of using fallback
      console.warn("🔍 Food recognition failed, showing manual input modal")
      setShowManualInputModal(true)
      return [] // Return empty array to trigger manual input
    }
  }, [])

  // Step 2: Data-to-Nutrition (Edamam API)
  const fetchNutritionalData = useCallback(async (foodItems: string[]) => {
    try {
      console.log("Step 2: Fetching nutritional data for:", foodItems)
      setAnalysisStep("🥗 Analyzing nutritional content...")
      setAnalysisProgress(30)

      const nutritionalData = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        dietLabels: [] as string[],
        healthLabels: [] as string[],
        totalNutrients: {} as any
      }

      // Try Edamam API first
      const foodName = foodItems[0]
      console.log("🍎 Calling Edamam API with food name:", foodName)
      
      // Check if we have a valid food name (not generic fallback)
      if (foodName && foodName !== "food item" && foodName !== "meal" && foodName.trim().length > 0) {
        const edamamResponse = await fetch("/api/edamam-nutrition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            foodName: foodName,
            image: capturedImage 
          }),
        })
        console.log("🍎 Edamam API response status:", edamamResponse.status)

        if (edamamResponse.ok) {
          const edamamData = await edamamResponse.json()
          console.log("🍎 Edamam API Response:", edamamData)
          console.log("🍎 Edamam success status:", edamamData.success)
          console.log("🍎 Edamam nutrition object:", edamamData.nutrition)
          console.log("🍎 Edamam food info:", edamamData.food_info)
          console.log("🍎 Edamam raw data:", edamamData.raw_data)
          
          if (edamamData.nutrition) {
            console.log("🍎 Processing Edamam nutrition data...")
            nutritionalData.calories = edamamData.nutrition.calories || 0
            nutritionalData.protein = edamamData.nutrition.protein || 0
            nutritionalData.fat = edamamData.nutrition.fat || 0
            nutritionalData.carbs = edamamData.nutrition.carbs || 0
            nutritionalData.fiber = edamamData.nutrition.fiber || 0
            nutritionalData.sugar = edamamData.nutrition.sugar || 0
            nutritionalData.sodium = edamamData.nutrition.sodium || 0
            nutritionalData.dietLabels = edamamData.nutrition.diet_labels || []
            nutritionalData.healthLabels = edamamData.nutrition.health_labels || []
            nutritionalData.totalNutrients = edamamData.nutrition.totalNutrients || {}
            
            console.log("🍎 Updated nutritional data with Edamam:", nutritionalData)
          } else {
            console.log("❌ No nutrition data found in Edamam response")
          }
        } else {
          const errorText = await edamamResponse.text()
          console.error("Edamam API failed:", edamamResponse.status, errorText)
          
          // Check if it's an API configuration issue
          if (edamamResponse.status === 500 && errorText.includes("not configured")) {
            console.warn("Edamam API not configured, will use fallback nutrition data")
          }
        }
      } else {
        console.log("🍎 Skipping Edamam API - invalid food name:", foodName)
      }

      // Fallback to Open Food Facts if Edamam fails
      if (nutritionalData.calories === 0) {
        setAnalysisProgress(50)
        console.log("Edamam failed, trying Open Food Facts...")
        
        try {
          const openFoodFactsResponse = await fetch("/api/openfoodfacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foodName: foodItems[0] }),
          })

          if (openFoodFactsResponse.ok) {
            const openFoodFactsData = await openFoodFactsResponse.json()
            console.log("Open Food Facts data:", openFoodFactsData)
            
            if (openFoodFactsData.nutrition) {
              nutritionalData.calories = openFoodFactsData.nutrition.calories || 0
              nutritionalData.protein = openFoodFactsData.nutrition.protein || 0
              nutritionalData.fat = openFoodFactsData.nutrition.fat || 0
              nutritionalData.carbs = openFoodFactsData.nutrition.carbs || 0
            }
          }
        } catch (openFoodFactsError) {
          console.error("Open Food Facts also failed:", openFoodFactsError)
        }
      }
      
      // Final fallback - use estimated nutritional data based on food type
      if (nutritionalData.calories === 0) {
        console.log("All APIs failed, using estimated nutritional data")
        
        // Provide more realistic estimates based on common food types
        const foodName = foodItems[0]?.toLowerCase() || "food"
        
        if (foodName.includes("pizza") || foodName.includes("burger")) {
          nutritionalData.calories = 350
          nutritionalData.protein = 15
          nutritionalData.fat = 12
          nutritionalData.carbs = 45
          nutritionalData.fiber = 2
          nutritionalData.sugar = 8
        } else if (foodName.includes("salad") || foodName.includes("vegetable")) {
          nutritionalData.calories = 120
          nutritionalData.protein = 5
          nutritionalData.fat = 3
          nutritionalData.carbs = 20
          nutritionalData.fiber = 6
          nutritionalData.sugar = 4
        } else if (foodName.includes("rice") || foodName.includes("pasta")) {
          nutritionalData.calories = 200
          nutritionalData.protein = 6
          nutritionalData.fat = 2
          nutritionalData.carbs = 40
          nutritionalData.fiber = 2
          nutritionalData.sugar = 1
        } else {
          // Default estimates for unknown foods
          nutritionalData.calories = 250
          nutritionalData.protein = 12
          nutritionalData.fat = 8
          nutritionalData.carbs = 35
          nutritionalData.fiber = 3
          nutritionalData.sugar = 5
        }
        
        nutritionalData.sodium = 300
        nutritionalData.dietLabels = ["Estimated"]
        nutritionalData.healthLabels = ["Estimated Values"]
      }

      console.log("Final nutritional data:", nutritionalData)
      setNutritionalData(nutritionalData)
      return nutritionalData

    } catch (error) {
      console.error("Nutritional data fetch error:", error)
      // Return default nutritional data
      return {
        calories: 200,
        protein: 10,
        fat: 5,
        carbs: 30,
        fiber: 3,
        sugar: 5,
        sodium: 300,
        dietLabels: [],
        healthLabels: [],
        totalNutrients: {}
      }
    }
  }, [capturedImage])

  // Handle manual food name input
  const handleManualFoodInput = useCallback(async () => {
    if (!manualFoodName.trim()) {
      setError("Please enter a food name")
      return
    }

    setIsManualInputLoading(true)
    setError(null)

    try {
      console.log("🔍 Processing manual food input:", manualFoodName)
      
      // Use the manual food name for analysis
      const foodItems = [manualFoodName.trim()]
      setIdentifiedFoods(foodItems)
      
      // Close the manual input modal
      setShowManualInputModal(false)
      
      // Continue with nutritional analysis
      const nutritionalData = await fetchNutritionalData(foodItems)
      console.log("🍎 Nutritional data for manual input:", nutritionalData)

      // Get user profile for personalized recommendations
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      // Generate verdict using our verdict engine
      const verdictPayload = {
        foodName: foodItems[0],
        clarifaiData: { 
          primaryFood: { name: foodItems[0] },
          confidence: 0.5 // Lower confidence for manual input
        },
        openFoodFactsData: { 
          nutrition: nutritionalData 
        },
        edamamData: { 
          nutrition: nutritionalData 
        },
        userProfile: profile
      }
      
      const verdictResponse = await fetch("/api/verdict-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verdictPayload),
      })

      if (!verdictResponse.ok) {
        throw new Error("Failed to generate verdict")
      }

      const verdictResult = await verdictResponse.json()
      
      // Create analysis result for manual input
      const analysisResultData = {
        foodName: foodItems[0],
        isRecommended: verdictResult.verdict?.is_recommended || true,
        healthScore: verdictResult.health_score || 70,
        confidence: 50, // Lower confidence for manual input
        nutritionalData: verdictResult.nutritional_data || nutritionalData,
        recommendation: verdictResult.verdict || { reason: "Analysis completed with manual input" },
        humorousResponse: verdictResult.humorous_response || "Thanks for providing the food name! 🍽️",
        identifiedFoods: foodItems,
        clarifaiData: { primaryFood: { name: foodItems[0] }, confidence: 0.5 },
        edamamData: { nutrition: nutritionalData },
        isManualInput: true // Flag to indicate this was manual input
      }
      
      console.log("📊 Manual input analysis result:", analysisResultData)
      setAnalysisResult(analysisResultData)
      setShowResultsModal(true)
      
    } catch (error) {
      console.error("Error processing manual food input:", error)
      setError("Failed to analyze the food. Please try again.")
    } finally {
      setIsManualInputLoading(false)
    }
  }, [manualFoodName, supabase, router, fetchNutritionalData])

  // Main meal analysis handler
  const handleAnalyzeMeal = useCallback(async () => {
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

      // Validate image format
      if (!capturedImage.startsWith("data:image/")) {
        throw new Error("Invalid image format. Please capture or upload a valid image.")
      }

      console.log("Starting meal analysis...")

      // Step 1: Image-to-Data (Food Recognition)
      let foodItems: string[] = []
      try {
        foodItems = await recognizeFoodItems(capturedImage)
        console.log("🔍 Food recognition completed. Identified foods:", foodItems)
      } catch (error) {
        console.error("Food recognition failed, using fallback:", error)
        foodItems = ["food item"] // Fallback food name
      }
      
      // If no food items identified, show manual input modal and stop analysis
      if (foodItems.length === 0) {
        console.log("🔍 No food items identified, showing manual input modal")
        console.log("🔍 Setting showManualInputModal to true")
        setShowManualInputModal(true)
        setIsAnalyzing(false)
        setAnalysisStep("")
        setAnalysisProgress(0)
        return
      }

      console.log("🔍 Proceeding with analysis for food items:", foodItems)

      // Step 2: Data-to-Nutrition (Edamam API)
      const nutritionalData = await fetchNutritionalData(foodItems)
      console.log("🍎 Final nutritional data after all APIs:", nutritionalData)
      console.log("🍎 Nutritional data calories:", nutritionalData.calories)
      console.log("🍎 Nutritional data protein:", nutritionalData.protein)

      // Step 3: Get user profile for personalized recommendations
      setAnalysisStep("👤 Loading your profile...")
      setAnalysisProgress(70)
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      console.log("User profile loaded:", profile)

      // Step 4: Generate verdict using our verdict engine
      setAnalysisStep("🧠 Generating personalized recommendations...")
      setAnalysisProgress(80)
      
      // Prepare data for verdict engine with proper structure
      const verdictPayload = {
        foodName: foodItems[0],
        clarifaiData: { 
          primaryFood: { name: foodItems[0] },
          confidence: 0.85 
        },
        openFoodFactsData: { 
          nutrition: nutritionalData 
        },
        edamamData: { 
          nutrition: nutritionalData 
        },
        userProfile: profile
      }
      
      console.log("Sending verdict payload:", verdictPayload)
      
      const verdictResponse = await fetch("/api/verdict-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verdictPayload),
      })

      if (!verdictResponse.ok) {
        const errorText = await verdictResponse.text()
        console.error("Verdict engine error:", errorText)
        throw new Error(`Failed to generate verdict: ${errorText}`)
      }

      const verdictResult = await verdictResponse.json()
      console.log("🧠 Verdict result:", verdictResult)
      console.log("🧠 Verdict nutritional_data:", verdictResult.nutritional_data)
      console.log("🧠 Verdict health_score:", verdictResult.health_score)
      
      // Validate verdict result structure and provide fallback
      if (!verdictResult.verdict || !verdictResult.nutritional_data) {
        console.error("Invalid verdict result structure, using fallback:", verdictResult)
        
        // Create fallback verdict result
        const fallbackVerdict = {
          is_recommended: true,
          reason: "Analysis completed with estimated data",
          warnings: [],
          benefits: ["Contains essential nutrients"],
          health_score: 70
        }
        
        const fallbackNutritionalData = {
          calories: nutritionalData.calories || 250,
          protein: nutritionalData.protein || 12,
          carbs: nutritionalData.carbs || 35,
          fat: nutritionalData.fat || 8,
          fiber: nutritionalData.fiber || 3,
          sugar: nutritionalData.sugar || 5,
          sodium: nutritionalData.sodium || 300
        }
        
        verdictResult.verdict = fallbackVerdict
        verdictResult.nutritional_data = fallbackNutritionalData
        verdictResult.health_score = 70
        verdictResult.humorous_response = "Analysis completed! 🎉"
      }
      
      // Final step
      setAnalysisStep("✅ Analysis complete!")
      setAnalysisProgress(100)

      // Save to database with proper nutritional data from verdict engine
      const { error: insertError } = await supabase.from("food_scans").insert({
        user_id: user.id,
        food_name: foodItems[0],
        scan_type: "camera",
        image_url: capturedImage,
        nutritional_data: verdictResult.nutritional_data, // Use processed data from verdict engine
        recommendation: verdictResult.verdict,
        is_recommended: verdictResult.verdict.is_recommended,
        confidence: 85, // Default confidence
        food_types: selectedFoodTypes,
        cooking_methods: selectedCookingMethods,
        oil_quantity: oilQuantity[0],
        meal_details: mealDetails,
        health_score: verdictResult.health_score,
        humorous_response: verdictResult.humorous_response
      })

      if (insertError) throw insertError

      // Navigate to results with all the actual data from APIs
      const resultParams = new URLSearchParams({
        food: foodItems[0],
        recommended: verdictResult.verdict.is_recommended.toString(),
        healthScore: verdictResult.health_score.toString(),
        confidence: "85",
        calories: verdictResult.nutritional_data.calories.toString(),
        protein: verdictResult.nutritional_data.protein.toString(),
        carbs: verdictResult.nutritional_data.carbs.toString(),
        fat: verdictResult.nutritional_data.fat.toString(),
        fiber: verdictResult.nutritional_data.fiber?.toString() || "0",
        sugar: verdictResult.nutritional_data.sugar?.toString() || "0",
        reason: verdictResult.verdict.reason,
        humorous: verdictResult.humorous_response || "Great choice! Your food has been analyzed with AI precision! 🤖"
      })

      // Show results in modal instead of redirecting
      const analysisResultData = {
        foodName: foodItems[0],
        isRecommended: verdictResult.verdict.is_recommended,
        healthScore: verdictResult.health_score,
        confidence: 85,
        nutritionalData: verdictResult.nutritional_data,
        recommendation: verdictResult.verdict,
        humorousResponse: verdictResult.humorous_response,
        identifiedFoods: foodItems,
        clarifaiData: { primaryFood: { name: foodItems[0] }, confidence: 0.85 },
        edamamData: { nutrition: nutritionalData }
      }
      
      console.log("📊 Analysis result data for modal:", analysisResultData)
      console.log("📊 Modal nutritional data:", analysisResultData.nutritionalData)
      console.log("📊 Modal Edamam data:", analysisResultData.edamamData)
      
      setAnalysisResult(analysisResultData)
      setShowResultsModal(true)

    } catch (err) {
      console.error("Error analyzing meal:", err)
      console.error("Full error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined
      })
      
      // Try to show partial results even if analysis failed
      if (identifiedFoods.length > 0 || nutritionalData) {
        console.log("Showing partial results despite error")
        
        // Create fallback data for partial results
        const fallbackResult = {
          foodName: identifiedFoods[0] || "food item",
          isRecommended: true,
          healthScore: 70,
          confidence: 60,
          nutritionalData: {
            calories: nutritionalData?.calories || 200,
            protein: nutritionalData?.protein || 10,
            carbs: nutritionalData?.carbs || 30,
            fat: nutritionalData?.fat || 5,
            fiber: nutritionalData?.fiber || 3,
            sugar: nutritionalData?.sugar || 5
          },
          recommendation: {
            is_recommended: true,
            reason: "Analysis completed with estimated data. Some APIs may not be configured.",
            tips: [
              "Analysis completed with limited data", 
              "Consider retaking the photo for better results",
              "Some nutritional data may be estimated"
            ],
            warnings: [],
            benefits: ["Contains essential nutrients"]
          },
          humorousResponse: "Analysis completed with partial data! 🎉",
          identifiedFoods: identifiedFoods,
          clarifaiData: { primaryFood: { name: identifiedFoods[0] || "food item" }, confidence: 0.6 },
          edamamData: { nutrition: nutritionalData }
        }
        
        setAnalysisResult(fallbackResult)
        setShowResultsModal(true)
        return
      }
      
      // If no partial data available, show error in modal with helpful information
      const errorResult = {
        foodName: "Analysis Failed",
        isRecommended: false,
        healthScore: 0,
        confidence: 0,
        nutritionalData: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0
        },
        recommendation: {
          is_recommended: false,
          reason: "Unable to analyze the food image. This might be due to API configuration issues or network problems.",
          tips: [
            "Try taking a clearer photo with good lighting",
            "Make sure the food is clearly visible in the frame",
            "Check your internet connection",
            "The analysis APIs might not be configured properly"
          ],
          warnings: ["Analysis could not be completed", "No nutritional data available"],
          benefits: []
        },
        humorousResponse: "Oops! Something went wrong. Let's try again! 🔄",
        identifiedFoods: [],
        clarifaiData: null,
        edamamData: null
      }
      
      setAnalysisResult(errorResult)
      setShowResultsModal(true)
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }, [capturedImage, supabase, router, selectedFoodTypes, selectedCookingMethods, oilQuantity, mealDetails, recognizeFoodItems, fetchNutritionalData])

  // Alias for backward compatibility
  const analyzeImage = handleAnalyzeMeal

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setError(null)
    setCameraError(null)
    setAnalysisProgress(0)
    setIsAnalyzing(false)
    setAnalysisStep("")
    setIdentifiedFoods([])
    setNutritionalData(null)
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
                    onClick={handleAnalyzeMeal}
                    disabled={isAnalyzing}
                    size="lg"
                    className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-200 font-medium"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Analyze my meal
                      </>
                    )}
                  </Button>

                  {/* Debug: Test manual input modal */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      onClick={testManualInputModal}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      disabled={isManualInputLoading}
                    >
                      {isManualInputLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        "✋ Try Manual Input"
                      )}
                    </Button>
                  )}
                </div>

                {/* Real-time Analysis Progress - Show right below the analyze button */}
                {isAnalyzing && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {analysisStep || "AI analyzing food..."}
                        </span>
                        <span className="font-bold">{Math.round(analysisProgress)}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                      
                      {/* Show identified foods if available */}
                      {identifiedFoods.length > 0 && (
                        <div className="text-xs text-gray-300">
                          <span className="font-medium">Identified: </span>
                          {identifiedFoods.join(", ")}
                        </div>
                      )}
                      
                      {/* Show nutritional data preview if available */}
                      {nutritionalData && (
                        <div className="text-xs text-gray-300">
                          <span className="font-medium">Nutrition: </span>
                          {nutritionalData.calories} cal, {nutritionalData.protein}g protein
                        </div>
                      )}
                      
                      {/* Debug information in development */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-yellow-400">
                          <span className="font-medium">Debug: </span>
                          Step: {analysisStep} | Progress: {Math.round(analysisProgress)}% | Foods: {identifiedFoods.length} | Nutrition: {nutritionalData ? 'Yes' : 'No'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

        {/* Error Messages - Only show camera errors, not analysis errors */}
        {cameraError && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20 mb-6">
            {cameraError}
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


        </div>
      </div>

      {/* Results Modal */}
      {showResultsModal && analysisResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">🍽️ Analysis Results</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResultsModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              {/* Food Name and Status */}
              <div className={`p-4 rounded-lg mb-6 ${analysisResult.isRecommended ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"}`}>
                <div className="flex items-center space-x-3 mb-2">
                  {analysisResult.isRecommended ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                  <h3 className="text-xl font-semibold text-foreground">{analysisResult.foodName}</h3>
                  {analysisResult.isManualInput && (
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      ✋ Manual Input
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={analysisResult.isRecommended ? "default" : "destructive"}>
                    {analysisResult.isRecommended ? "✅ Recommended" : "⚠️ Not Recommended"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Health Score: {analysisResult.healthScore}/100
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Confidence: {analysisResult.confidence}%
                  </span>
                </div>
              </div>

              {/* Identified Foods from Clarifai */}
              {analysisResult.identifiedFoods && analysisResult.identifiedFoods.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">🔍 Identified Foods (Clarifai)</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.identifiedFoods.map((food: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clarifai Data Display */}
              {analysisResult.clarifaiData && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">🔍 Clarifai Recognition Data</h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="text-sm space-y-2">
                      <div><strong>Primary Food:</strong> {analysisResult.clarifaiData.primaryFood?.name || 'N/A'}</div>
                      <div><strong>Confidence:</strong> {analysisResult.clarifaiData.confidence ? (analysisResult.clarifaiData.confidence * 100).toFixed(1) + '%' : 'N/A'}</div>
                      <div><strong>Raw Clarifai Data:</strong> {JSON.stringify(analysisResult.clarifaiData, null, 2)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nutritional Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground mb-3">📊 Nutritional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <div className="text-xl font-bold text-foreground">{analysisResult.nutritionalData.calories}</div>
                    <div className="text-sm text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <div className="text-xl font-bold text-foreground">{analysisResult.nutritionalData.protein}g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <div className="text-xl font-bold text-foreground">{analysisResult.nutritionalData.carbs}g</div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-accent/50 rounded-lg">
                    <div className="text-xl font-bold text-foreground">{analysisResult.nutritionalData.fat}g</div>
                    <div className="text-sm text-muted-foreground">Fat</div>
                  </div>
                </div>
              </div>

              {/* Edamam Data Display */}
              {analysisResult.edamamData && analysisResult.edamamData.nutrition && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-foreground mb-3">🍎 Edamam Nutrition Data</h4>
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Calories:</strong> {analysisResult.edamamData.nutrition.calories || 'N/A'}</div>
                      <div><strong>Protein:</strong> {analysisResult.edamamData.nutrition.protein || 'N/A'}g</div>
                      <div><strong>Carbs:</strong> {analysisResult.edamamData.nutrition.carbs || 'N/A'}g</div>
                      <div><strong>Fat:</strong> {analysisResult.edamamData.nutrition.fat || 'N/A'}g</div>
                      <div><strong>Fiber:</strong> {analysisResult.edamamData.nutrition.fiber || 'N/A'}g</div>
                      <div><strong>Sugar:</strong> {analysisResult.edamamData.nutrition.sugar || 'N/A'}g</div>
                      <div><strong>Sodium:</strong> {analysisResult.edamamData.nutrition.sodium || 'N/A'}mg</div>
                      <div><strong>Health Labels:</strong> {analysisResult.edamamData.nutrition.health_labels?.join(', ') || 'N/A'}</div>
                    </div>
                    {analysisResult.edamamData.nutrition.diet_labels && analysisResult.edamamData.nutrition.diet_labels.length > 0 && (
                      <div className="mt-3">
                        <strong>Diet Labels:</strong> {analysisResult.edamamData.nutrition.diet_labels.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Recommendation */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground mb-3">🤖 AI Recommendation</h4>
                <div className={`p-4 rounded-lg ${analysisResult.isRecommended ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"}`}>
                  <p className={`text-sm ${analysisResult.isRecommended ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
                    {analysisResult.recommendation.reason}
                  </p>
                </div>
              </div>

              {/* Humorous Response */}
              {analysisResult.humorousResponse && (
                <div className="mb-6">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      {analysisResult.humorousResponse}
                    </p>
                  </div>
                </div>
              )}

              {/* Tips and Warnings */}
              {(analysisResult.recommendation.tips?.length > 0 || analysisResult.recommendation.warnings?.length > 0) && (
                <div className="mb-6">
                  {analysisResult.recommendation.tips?.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-foreground mb-2">💡 Tips</h5>
                      <ul className="space-y-1">
                        {analysisResult.recommendation.tips.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysisResult.recommendation.warnings?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ Warnings</h5>
                      <ul className="space-y-1">
                        {analysisResult.recommendation.warnings.map((warning: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-red-700 dark:text-red-400">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Debug Information - API Data */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">🔍 API Debug Data</h5>
                  <div className="text-xs space-y-2 text-yellow-700 dark:text-yellow-300">
                    <div><strong>Clarifai Data Available:</strong> {analysisResult.clarifaiData ? 'Yes' : 'No'}</div>
                    {analysisResult.clarifaiData && (
                      <div><strong>Clarifai Response:</strong> {JSON.stringify(analysisResult.clarifaiData, null, 2)}</div>
                    )}
                    <div><strong>Edamam Data Available:</strong> {analysisResult.edamamData ? 'Yes' : 'No'}</div>
                    {analysisResult.edamamData && (
                      <>
                        <div><strong>Edamam Nutrition:</strong> {JSON.stringify(analysisResult.edamamData.nutrition, null, 2)}</div>
                        <div><strong>Raw Edamam Response:</strong> {JSON.stringify(analysisResult.edamamData, null, 2)}</div>
                      </>
                    )}
                    <div><strong>Final Nutritional Data:</strong> {JSON.stringify(analysisResult.nutritionalData, null, 2)}</div>
                    <div><strong>Identified Foods:</strong> {JSON.stringify(analysisResult.identifiedFoods, null, 2)}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowResultsModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowResultsModal(false)
                    retakePhoto()
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Scan Another
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Food Input Modal */}
      {console.log("🔍 Rendering modal check - showManualInputModal:", showManualInputModal)}
      {showManualInputModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Oops! AI Needs Help</h2>
                <p className="text-muted-foreground">
                  Our AI couldn't identify the food in your image. No worries! You can help us out by entering the food name manually.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Food Name Input */}
              <div className="mb-6">
                <label htmlFor="manualFoodName" className="block text-sm font-medium text-foreground mb-2">
                  What food did you capture? 🍽️
                </label>
                <input
                  id="manualFoodName"
                  type="text"
                  value={manualFoodName}
                  onChange={(e) => setManualFoodName(e.target.value)}
                  placeholder="e.g., Pizza, Biryani, Salad, Pasta..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                  disabled={isManualInputLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isManualInputLoading) {
                      handleManualFoodInput()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be as specific as possible for better nutritional analysis
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowManualInputModal(false)
                    setManualFoodName("")
                    setError(null)
                    retakePhoto()
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isManualInputLoading}
                >
                  📸 Try Again
                </Button>
                <Button
                  onClick={handleManualFoodInput}
                  className="flex-1"
                  disabled={isManualInputLoading || !manualFoodName.trim()}
                >
                  {isManualInputLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    "🍎 Analyze Food"
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>💡 Tip:</strong> Try taking a clearer photo with better lighting, or enter the food name manually. 
                  Our AI works best with well-lit, clear images of food items.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
