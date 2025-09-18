"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Camera, Upload, Loader2, Zap, Target } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef, useCallback, useEffect } from "react"

export default function CameraScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
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

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions or try uploading an image instead.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
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
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      console.log("[v0] Starting AI food analysis...")

      // Step 1: Analyze food image with AI
      const analysisResponse = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze food image")
      }

      const { analysis } = await analysisResponse.json()
      console.log("[v0] Food analysis result:", analysis)

      setAnalysisProgress(50)

      // Step 2: Get nutritional information
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
      console.log("[v0] Nutrition data:", nutrition)

      setAnalysisProgress(80)

      // Get user profile for personalized recommendation
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      const recommendation = generatePersonalizedRecommendation(analysis, nutrition, profile)

      setAnalysisProgress(100)

      // Save scan to database
      const { error: insertError } = await supabase.from("food_scans").insert({
        user_id: user.id,
        food_name: analysis.foodName,
        scan_type: "camera",
        image_url: capturedImage,
        nutritional_data: nutrition,
        recommendation: recommendation,
        is_recommended: recommendation.is_recommended,
        confidence: Math.round(analysis.confidence * 100),
      })

      if (insertError) throw insertError

      // Redirect to results page
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
  }, [capturedImage, supabase, router])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setError(null)
    startCamera()
  }, [startCamera])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900">
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
              <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">AI Camera Scan</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900">
          <CardHeader className="text-center">
            <CardTitle className="text-emerald-800 dark:text-emerald-200">Scan Your Food</CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-400">
              Take a photo for real-time AI food recognition and nutritional analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {!capturedImage && !isScanning && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-300 mb-6">
                    Point your camera at food for AI-powered recognition and health insights
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>GPT-4 Vision</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>Real-time Analysis</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={startCamera}
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900"
                      size="lg"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black"
                    style={{ aspectRatio: "16/9" }}
                  />
                  <div className="absolute inset-0 border-4 border-emerald-400 dark:border-emerald-500 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-emerald-400 dark:border-emerald-500"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-emerald-400 dark:border-emerald-500"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-emerald-400 dark:border-emerald-500"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-emerald-400 dark:border-emerald-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Position food in frame
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-transparent"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <img src={capturedImage || "/placeholder.svg"} alt="Captured food" className="w-full rounded-lg" />
                  {!isAnalyzing && (
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-full text-sm font-medium text-emerald-800 dark:text-emerald-200">
                        Ready for AI analysis
                      </div>
                    </div>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700 dark:text-emerald-300">AI analyzing food...</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{Math.round(analysisProgress)}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
                      {analysisProgress < 30 && "Processing image with AI vision..."}
                      {analysisProgress >= 30 && analysisProgress < 60 && "Identifying food with GPT-4..."}
                      {analysisProgress >= 60 && analysisProgress < 90 && "Searching nutrition database..."}
                      {analysisProgress >= 90 && "Generating personalized insights..."}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Analyze Food
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    disabled={isAnalyzing}
                    className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-transparent"
                    size="lg"
                  >
                    Retake
                  </Button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">
              Tips for Better AI Recognition
            </h3>
            <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-2">
              <li>• Ensure good lighting when taking photos</li>
              <li>• Include the entire food item in the frame</li>
              <li>• Avoid shadows and reflections</li>
              <li>• Take photos from directly above for best recognition</li>
              <li>• AI works with all cuisines - Indian, Chinese, Italian, and more!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function generatePersonalizedRecommendation(analysis: any, nutrition: any, profile: any) {
  const healthScore = nutrition.healthScore || 5
  const isRecommended = healthScore >= 6

  const tips = nutrition.healthTips || []

  // Add personalized tips based on user profile
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
