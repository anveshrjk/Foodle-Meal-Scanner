"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, Loader2, Zap, Target, RotateCcw, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useCallback, useEffect } from "react"
import { Header } from "@/components/header"

export default function CameraScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [showCaptureSuccess, setShowCaptureSuccess] = useState(false)
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
          aspectRatio: { ideal: 4 / 3 }, // Better for food photos
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

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95) // Higher quality
    setCapturedImage(imageDataUrl)
    console.log("[v0] Photo captured successfully")

    setShowCaptureSuccess(true)
    setTimeout(() => setShowCaptureSuccess(false), 1000)

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
    <div className="min-h-screen bg-background">
      <Header showBack backHref="/dashboard" title="AI Food Scanner" subtitle="Snap, analyze, discover!" />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {!capturedImage && !isScanning && (
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-foreground">Ready to Decode Your Food? 🕵️</CardTitle>
              <CardDescription className="text-muted-foreground">
                Point, shoot, and let AI reveal the secrets of your meal!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-foreground mb-6 font-medium">
                    Transform any food into health insights instantly! ✨
                  </p>
                  <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>GPT-4 Vision</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span>Real-time Analysis</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={startCamera}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Launch Food Scanner 📸
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-border text-foreground hover:bg-accent"
                      size="lg"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload from Gallery 📱
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
            </CardContent>
          </Card>
        )}

        {isScanning && (
          <div className="space-y-4">
            <Card className="border-border bg-card overflow-hidden">
              <div className="relative bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-[70vh] object-cover" />

                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner brackets */}
                  <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-2xl"></div>
                  <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-2xl"></div>
                  <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-2xl"></div>
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-2xl"></div>

                  {/* Center scanning area */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-primary/60 rounded-2xl bg-primary/5 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <Target className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                        <p className="text-white text-sm font-medium bg-black/70 px-3 py-1 rounded-full">
                          Position food here
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top instruction */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
                      🍽️ Center your food in the frame
                    </div>
                  </div>
                </div>

                {showCaptureSuccess && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground p-4 rounded-full">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex items-center justify-center space-x-4 py-4">
              <Button
                onClick={stopCamera}
                variant="outline"
                size="lg"
                className="px-6 border-border text-muted-foreground hover:bg-accent bg-transparent"
              >
                Cancel
              </Button>

              <Button
                onClick={capturePhoto}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-full shadow-lg"
              >
                <Camera className="w-6 h-6 mr-2" />
                Capture 📸
              </Button>

              <Button
                onClick={() => {
                  stopCamera()
                  setTimeout(startCamera, 100)
                }}
                variant="outline"
                size="lg"
                className="px-6 border-border text-muted-foreground hover:bg-accent"
              >
                <RotateCcw className="w-5 h-5" />
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

        <Card className="mt-6 border-border bg-accent/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Pro Tips for Perfect Scans 🎯
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 💡 Ensure bright, natural lighting</li>
              <li>• 🎯 Fill the frame with your food</li>
              <li>• 🚫 Avoid shadows and reflections</li>
              <li>• 📐 Shoot from directly above for best results</li>
              <li>• 🌍 Works with ALL cuisines - Indian, Chinese, Italian, and more!</li>
            </ul>
          </CardContent>
        </Card>
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
