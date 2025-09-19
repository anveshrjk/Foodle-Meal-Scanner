"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Scan, Loader2, Package, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useCallback } from "react"
import { Header } from "@/components/header"

// Mock barcode database
const mockBarcodeDatabase: Record<string, any> = {
  "123456789012": {
    name: "Organic Whole Wheat Bread",
    brand: "Nature's Best",
    calories: 80,
    protein: 4,
    carbs: 15,
    fat: 1.5,
    fiber: 3,
    sugar: 2,
    ingredients: ["Whole wheat flour", "Water", "Yeast", "Salt", "Honey"],
  },
  "987654321098": {
    name: "Greek Yogurt Plain",
    brand: "Mountain High",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
    fiber: 0,
    sugar: 6,
    ingredients: ["Milk", "Live active cultures"],
  },
  "456789123456": {
    name: "Almond Butter",
    brand: "Natural Choice",
    calories: 190,
    protein: 7,
    carbs: 7,
    fat: 17,
    fiber: 3,
    sugar: 2,
    ingredients: ["Roasted almonds", "Salt"],
  },
}

export default function BarcodePage() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [scannedProduct, setScannedProduct] = useState<any>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const startBarcodeScanner = useCallback(async () => {
    try {
      setError(null)

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
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
      setError("Unable to access camera. Please check permissions or enter barcode manually.")
    }
  }, [])

  const stopScanner = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [stream])

  const processBarcode = useCallback(async (barcode: string) => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setError(null)

    try {
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      clearInterval(progressInterval)

      const product = mockBarcodeDatabase[barcode]

      if (!product) {
        setError(`Product not found for barcode: ${barcode}. Try a different product or use manual search.`)
        setIsAnalyzing(false)
        setAnalysisProgress(0)
        return
      }

      setAnalysisProgress(100)
      setScannedProduct(product)
    } catch (err) {
      console.error("Error processing barcode:", err)
      setError("Failed to process barcode. Please try again.")
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 1000)
    }
  }, [])

  const handleManualBarcode = useCallback(() => {
    if (!manualBarcode.trim()) {
      setError("Please enter a valid barcode")
      return
    }
    processBarcode(manualBarcode.trim())
  }, [manualBarcode, processBarcode])

  const analyzeProduct = useCallback(async () => {
    if (!scannedProduct) return

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

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      const isRecommended = scannedProduct.calories < 200 && scannedProduct.protein > 5 && scannedProduct.sugar < 10

      const mockRecommendation = {
        is_recommended: isRecommended,
        reason: isRecommended
          ? `${scannedProduct.name} is a good choice! It has balanced nutrition and fits your health goals.`
          : `${scannedProduct.name} might not be ideal. Consider checking the sugar content and portion size.`,
        tips: [
          "Check the ingredient list for additives",
          "Consider portion size recommendations",
          "Look for alternatives with less sugar if needed",
        ],
      }

      const { error: insertError } = await supabase.from("food_scans").insert({
        user_id: user.id,
        food_name: scannedProduct.name,
        scan_type: "barcode",
        barcode: manualBarcode || "scanned",
        nutritional_data: scannedProduct,
        recommendation: mockRecommendation,
        is_recommended: isRecommended,
      })

      if (insertError) throw insertError

      router.push(`/scan/results?food=${encodeURIComponent(scannedProduct.name)}&recommended=${isRecommended}`)
    } catch (err) {
      console.error("Error analyzing product:", err)
      setError("Failed to analyze product. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [scannedProduct, supabase, router, manualBarcode])

  const simulateBarcodeDetection = useCallback(() => {
    const mockBarcodes = Object.keys(mockBarcodeDatabase)
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
    processBarcode(randomBarcode)
    stopScanner()
  }, [processBarcode, stopScanner])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
      {/* Header */}
      <Header showBack backHref="/dashboard" title="Barcode Scanner" subtitle="Decode packaged foods instantly!" />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Camera Preview Section */}
        <div className="mb-6">
          <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
            {!isScanning ? (
              // Camera placeholder when not scanning
              <div className="w-full h-80 bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-lg font-medium">Barcode Scanner</p>
                    <p className="text-gray-500 text-sm">Start scanning to see live feed</p>
                  </div>
                </div>
              </div>
            ) : (
              // Live camera feed with barcode scanning frame
              <div className="relative w-full h-80">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                
                {/* Barcode scanning frame overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-64 h-40 border-2 border-white/60 rounded-lg">
                    {/* Corner brackets */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg"></div>

                    {/* Scanning line animation */}
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div
                        className="absolute w-full h-0.5 bg-red-500 animate-pulse"
                        style={{
                          top: "50%",
                          boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Instructions overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium text-center">
                    Position barcode within the frame
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scanner Controls */}
        {!isScanning && (
          <div className="space-y-4 mb-6">
            <Button
              onClick={startBarcodeScanner}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              size="lg"
            >
              <Scan className="w-5 h-5 mr-2" />
              Start Barcode Scanner
            </Button>
            
            <div className="flex space-x-3">
              <Input
                placeholder="Enter barcode number manually"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="flex-1 transition-all duration-200"
              />
              <Button
                onClick={handleManualBarcode}
                disabled={isAnalyzing || !manualBarcode.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
              </Button>
            </div>
          </div>
        )}

        {/* Scanner Controls */}
        {isScanning && (
          <div className="space-y-4 mb-6">
            <Button
              onClick={simulateBarcodeDetection}
              className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
              size="lg"
            >
              <Scan className="w-5 h-5 mr-2" />
              Simulate Barcode Detection
            </Button>
            
            <Button
              onClick={stopScanner}
              variant="outline"
              className="w-full transition-all duration-200"
              size="lg"
            >
              Stop Scanner
            </Button>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20 mb-6">
            {error}
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-3 bg-accent p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">Analyzing barcode...</span>
              <span className="text-foreground font-bold">{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        {/* Product Details */}
        {scannedProduct && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-foreground font-bold">{scannedProduct.name}</h3>
                <p className="text-muted-foreground text-sm">{scannedProduct.brand}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Calories", value: scannedProduct.calories },
                { label: "Protein", value: `${scannedProduct.protein}g` },
                { label: "Carbs", value: `${scannedProduct.carbs}g` },
                { label: "Fat", value: `${scannedProduct.fat}g` },
                { label: "Fiber", value: `${scannedProduct.fiber}g` },
                { label: "Sugar", value: `${scannedProduct.sugar}g` },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 bg-accent rounded-lg">
                  <div className="font-semibold text-foreground">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Ingredients</h4>
              <p className="text-sm text-muted-foreground">{scannedProduct.ingredients.join(", ")}</p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={analyzeProduct}
                disabled={isAnalyzing}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Get Recommendation
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setScannedProduct(null)
                  setManualBarcode("")
                  setError(null)
                }}
                variant="outline"
                disabled={isAnalyzing}
                className="transition-all duration-200"
                size="lg"
              >
                Scan Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}
