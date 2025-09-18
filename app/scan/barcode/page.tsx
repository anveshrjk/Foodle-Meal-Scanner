"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Scan, Loader2, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useRef, useCallback } from "react"

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
  const [error, setError] = useState<string | null>(null)
  const [scannedProduct, setScannedProduct] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const startBarcodeScanner = useCallback(async () => {
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
      setError("Unable to access camera. Please check permissions or enter barcode manually.")
    }
  }, [])

  const stopScanner = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [])

  const processBarcode = useCallback(async (barcode: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // Simulate barcode lookup delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Look up product in mock database
      const product = mockBarcodeDatabase[barcode]

      if (!product) {
        setError(`Product not found for barcode: ${barcode}. Try a different product or use manual search.`)
        setIsAnalyzing(false)
        return
      }

      setScannedProduct(product)
    } catch (err) {
      console.error("Error processing barcode:", err)
      setError("Failed to process barcode. Please try again.")
    } finally {
      setIsAnalyzing(false)
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
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get user profile for personalized recommendation
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      // Mock recommendation logic
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

      // Save scan to database
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

      // Redirect to results page
      router.push(`/scan/results?food=${encodeURIComponent(scannedProduct.name)}&recommended=${isRecommended}`)
    } catch (err) {
      console.error("Error analyzing product:", err)
      setError("Failed to analyze product. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [scannedProduct, supabase, router, manualBarcode])

  // Mock barcode detection (in real app, you'd use a barcode scanning library)
  const simulateBarcodeDetection = useCallback(() => {
    const mockBarcodes = Object.keys(mockBarcodeDatabase)
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
    processBarcode(randomBarcode)
    stopScanner()
  }, [processBarcode, stopScanner])

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
            <div className="flex items-center space-x-2">
              <Scan className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-emerald-800">Barcode Scanner</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="border-emerald-200">
          <CardHeader className="text-center">
            <CardTitle className="text-emerald-800">Scan Product Barcode</CardTitle>
            <CardDescription className="text-emerald-600">
              Scan or enter a barcode to get detailed product information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200">{error}</div>
            )}

            {!scannedProduct && !isScanning && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <Scan className="w-16 h-16 text-emerald-600" />
                  </div>
                  <p className="text-emerald-700 mb-6">
                    Scan the barcode on packaged foods for instant nutritional analysis
                  </p>
                </div>

                <Button
                  onClick={startBarcodeScanner}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Start Barcode Scanner
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-emerald-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-emerald-600">Or</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="barcode" className="text-emerald-700">
                    Enter Barcode Manually
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      id="barcode"
                      placeholder="Enter barcode number"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      className="flex-1 border-emerald-200 focus:border-emerald-400"
                    />
                    <Button
                      onClick={handleManualBarcode}
                      disabled={isAnalyzing || !manualBarcode.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
                    </Button>
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-32 border-4 border-emerald-400 rounded-lg">
                      <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-emerald-400"></div>
                      <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-emerald-400"></div>
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-emerald-400"></div>
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-emerald-400"></div>
                    </div>
                  </div>
                </div>

                <p className="text-center text-emerald-700">Position the barcode within the frame</p>

                <div className="flex space-x-3">
                  <Button
                    onClick={simulateBarcodeDetection}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                  >
                    Simulate Scan
                  </Button>
                  <Button
                    onClick={stopScanner}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 bg-transparent"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {scannedProduct && (
              <div className="space-y-4">
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-emerald-600" />
                      <CardTitle className="text-emerald-800">{scannedProduct.name}</CardTitle>
                    </div>
                    <CardDescription className="text-emerald-600">{scannedProduct.brand}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="font-semibold text-emerald-800">{scannedProduct.calories}</div>
                        <div className="text-emerald-600">Calories</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="font-semibold text-emerald-800">{scannedProduct.protein}g</div>
                        <div className="text-emerald-600">Protein</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="font-semibold text-emerald-800">{scannedProduct.carbs}g</div>
                        <div className="text-emerald-600">Carbs</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="font-semibold text-emerald-800">{scannedProduct.fat}g</div>
                        <div className="text-emerald-600">Fat</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="font-semibold text-emerald-800">{scannedProduct.fiber}g</div>
                        <div className="text-emerald-600">Fiber</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="font-semibold text-emerald-800">{scannedProduct.sugar}g</div>
                        <div className="text-emerald-600">Sugar</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-emerald-800 mb-2">Ingredients</h4>
                      <p className="text-sm text-emerald-700">{scannedProduct.ingredients.join(", ")}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-3">
                  <Button
                    onClick={analyzeProduct}
                    disabled={isAnalyzing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Scan className="w-5 h-5 mr-2" />
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
                    className="border-emerald-300 text-emerald-700"
                    size="lg"
                  >
                    Scan Another
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Barcodes */}
        <Card className="mt-6 border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-800">Try These Demo Barcodes</CardTitle>
            <CardDescription className="text-emerald-600">
              Use these sample barcodes to test the scanner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(mockBarcodeDatabase).map(([barcode, product]) => (
                <div key={barcode} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <span className="font-mono text-sm text-emerald-800">{barcode}</span>
                    <span className="ml-3 text-emerald-600">{product.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setManualBarcode(barcode)
                      processBarcode(barcode)
                    }}
                    className="border-emerald-300 text-emerald-700"
                  >
                    Try
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
