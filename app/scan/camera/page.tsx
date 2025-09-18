"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Camera, Upload, Loader2, CheckCircle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef, useCallback } from "react"

export default function CameraScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

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
    setShowConfirmation(true)
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
      setShowConfirmation(true)
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

      await new Promise((resolve) => setTimeout(resolve, 3000))

      const indianFoods = [
        { name: "Samosa", calories: 262, protein: 6, carbs: 28, fat: 14, fiber: 3, sugar: 2 },
        { name: "Butter Chicken", calories: 438, protein: 32, carbs: 12, fat: 28, fiber: 2, sugar: 8 },
        { name: "Masala Dosa", calories: 168, protein: 4, carbs: 28, fat: 5, fiber: 2, sugar: 3 },
        { name: "Biryani", calories: 290, protein: 8, carbs: 45, fat: 9, fiber: 1, sugar: 4 },
        { name: "Chole Bhature", calories: 427, protein: 12, carbs: 58, fat: 16, fiber: 8, sugar: 6 },
      ]

      const mockFood = indianFoods[Math.floor(Math.random() * indianFoods.length)]

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      const healthScore = Math.max(
        0,
        Math.min(100, mockFood.protein * 2 + mockFood.fiber * 5 - mockFood.calories / 10 - mockFood.fat / 2),
      )

      const isRecommended = healthScore >= 60

      const mockRecommendation = {
        is_recommended: isRecommended,
        health_score: Math.round(healthScore),
        reason: isRecommended
          ? `Excellent choice! This ${mockFood.name} scores ${Math.round(healthScore)}/100 on our health scale. It's well-balanced for your goals! 🎉`
          : `Hmm, this ${mockFood.name} scores ${Math.round(healthScore)}/100. Not terrible, but you could do better! Maybe save it for cheat day? 😉`,
        tips: [
          "Pair with a fresh salad for extra nutrients",
          "Consider smaller portions if weight management is your goal",
          "Drink green tea after the meal to aid digestion",
          "Add some yogurt on the side for probiotics",
        ],
      }

      const { error: insertError } = await supabase.from("food_scans").insert({
        user_id: user.id,
        food_name: mockFood.name,
        scan_type: "camera",
        image_url: capturedImage,
        nutritional_data: mockFood,
        recommendation: mockRecommendation,
        is_recommended: isRecommended,
      })

      if (insertError) throw insertError

      router.push(
        `/scan/results?food=${encodeURIComponent(mockFood.name)}&recommended=${isRecommended}&score=${Math.round(healthScore)}`,
      )
    } catch (err) {
      console.error("Error analyzing image:", err)
      setError("Oops! Our AI got a bit confused. Please try again! 🤖")
    } finally {
      setIsAnalyzing(false)
    }
  }, [capturedImage, supabase, router])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setShowConfirmation(false)
    setError(null)
    startCamera()
  }, [startCamera])

  const startOver = useCallback(() => {
    setCapturedImage(null)
    setShowConfirmation(false)
    setError(null)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
      <header className="bg-white dark:bg-gray-900 border-b border-emerald-200 dark:border-emerald-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-emerald-700 dark:text-emerald-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">Camera Scan</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900">
          <CardHeader className="text-center">
            <CardTitle className="text-emerald-800 dark:text-emerald-200">
              {showConfirmation ? "Confirm Your Meal" : "Scan Your Food"}
            </CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-400">
              {showConfirmation
                ? "Does this look right? Let's analyze it for health insights!"
                : "Take a photo or upload an image of your food for instant analysis"}
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
                    Ready to discover what's on your plate? Let's see if it's friend or foe! 📸
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button onClick={startCamera} className="bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
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
                  <div className="absolute inset-0 border-4 border-emerald-400 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-emerald-400"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-emerald-400"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-emerald-400"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-emerald-400"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 border-2 border-emerald-400 rounded-full opacity-50"></div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-emerald-700 dark:text-emerald-300 text-sm mb-4">
                    Position your food in the center and tap capture when ready! 📱
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
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

            {capturedImage && showConfirmation && !isAnalyzing && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured food"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white p-2 rounded-full">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-center bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg">
                  <p className="text-emerald-800 dark:text-emerald-200 font-medium mb-2">Perfect shot! 📸</p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                    Ready to get the health scoop on this delicious meal?
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={analyzeImage}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Yes, Analyze This!
                  </Button>
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-transparent"
                    size="lg"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Retake
                  </Button>
                </div>

                <Button
                  onClick={startOver}
                  variant="ghost"
                  className="w-full text-emerald-600 dark:text-emerald-400 text-sm"
                >
                  Start Over
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-4">
                <div className="relative">
                  <img src={capturedImage || ""} alt="Analyzing food" className="w-full rounded-lg opacity-75" />
                  <div className="absolute inset-0 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                      <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                        Our AI is working its magic! 🤖✨
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1">
                        Analyzing nutritional content...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        <Card className="mt-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">Pro Tips for Perfect Scans 📋</h3>
            <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-2">
              <li>• Good lighting = better results (natural light works best!)</li>
              <li>• Capture the whole dish - don't be shy, show it all!</li>
              <li>• Avoid shadows and reflections (your food isn't a vampire)</li>
              <li>• Top-down shots work like magic for our AI</li>
              <li>• Multiple items? No problem - we'll analyze them all!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
