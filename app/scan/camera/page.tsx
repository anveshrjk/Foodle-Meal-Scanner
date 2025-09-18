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
  const [stream, setStream] = useState<MediaStream | null>(null)
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
      console.log("[v0] Starting camera...")

      const constraints = {
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 16 / 9 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("[v0] Camera stream obtained")

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)

        videoRef.current.onloadedmetadata = () => {
          console.log("[v0] Video metadata loaded, camera ready")
        }
      }
    } catch (err) {
      console.error("[v0] Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions and try again, or upload an image instead.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    console.log("[v0] Stopping camera...")
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
        console.log("[v0] Camera track stopped")
      })
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("[v0] Video or canvas ref not available")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) {
      console.log("[v0] Canvas context not available")
      return
    }

    console.log("[v0] Capturing photo...")

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)
    setCapturedImage(imageDataUrl)
    console.log("[v0] Photo captured successfully")

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

      console.log("[v0] Starting AI food analysis...")

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
  }, [capturedImage, supabase, router])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setError(null)
    startCamera()
  }, [startCamera])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-900 border-b border-emerald-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-200">AI Food Scanner</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="border-emerald-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-emerald-800 dark:text-emerald-200">Scan Your Food</CardTitle>
            <CardDescription className="text-emerald-600 dark:text-gray-400">
              Take a photo for AI-powered food recognition and nutritional analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {!capturedImage && !isScanning && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-emerald-700 dark:text-gray-300 mb-6">
                    Point your camera at food for instant AI recognition
                  </p>
                  <div className="flex items-center justify-center space-x-6 text-sm text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>GPT-4 Vision</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Real-time Analysis</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={startCamera}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-emerald-300 dark:border-gray-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-gray-800"
                      size="lg"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Image Instead
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
            )}

            {isScanning && (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto max-h-[60vh] object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-emerald-400 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-emerald-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-emerald-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-emerald-400 rounded-br-lg"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                        Position food in frame
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-lg py-3"
                    size="lg"
                  >
                    <Camera className="w-6 h-6 mr-2" />
                    Capture Photo
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="px-6 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
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
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured food"
                    className="w-full rounded-lg shadow-md max-h-[50vh] object-cover"
                  />
                  {!isAnalyzing && (
                    <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Ready for AI analysis
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="space-y-3 bg-emerald-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">AI analyzing food...</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {Math.round(analysisProgress)}%
                      </span>
                    </div>
                    <Progress value={analysisProgress} className="h-3" />
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
                      {analysisProgress < 30 && "🔍 Processing image with AI vision..."}
                      {analysisProgress >= 30 && analysisProgress < 60 && "🧠 Identifying food with GPT-4..."}
                      {analysisProgress >= 60 && analysisProgress < 90 && "📊 Searching nutrition database..."}
                      {analysisProgress >= 90 && "✨ Generating personalized insights..."}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-lg py-3"
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
                    className="px-6 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
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

        <Card className="mt-6 border-emerald-200 dark:border-gray-700 bg-emerald-50 dark:bg-gray-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Tips for Better Recognition
            </h3>
            <ul className="text-sm text-emerald-700 dark:text-gray-300 space-y-2">
              <li>• Ensure good lighting when taking photos</li>
              <li>• Include the entire food item in the frame</li>
              <li>• Avoid shadows and reflections on the food</li>
              <li>• Take photos from directly above for best results</li>
              <li>• Works with all cuisines - Indian, Chinese, Italian, and more!</li>
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
