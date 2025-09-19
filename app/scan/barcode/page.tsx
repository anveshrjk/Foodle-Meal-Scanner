"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scan, Loader2, Package } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
      <Header showBack backHref="/dashboard" title="Barcode Scanner" subtitle="Decode packaged foods instantly! 📦" />

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">🔍 Barcode Detective Mode</CardTitle>
            <CardDescription className="text-muted-foreground">
              Scan or enter a barcode to unlock product secrets!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            {!scannedProduct && !isScanning && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Scan className="w-16 h-16 text-primary" />
                  </div>
                  <p className="text-foreground mb-6 font-medium">🕵️ Ready to decode your food's secrets?</p>
                </div>

                <Button
                  onClick={startBarcodeScanner}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Launch Barcode Scanner 🚀
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="barcode" className="text-foreground">
                    Enter Barcode Manually
                  </Label>
                  <div className="flex space-x-3">
                    <Input
                      id="barcode"
                      placeholder="Enter barcode number"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      className="flex-1 border-border focus:border-primary"
                    />
                    <Button
                      onClick={handleManualBarcode}
                      disabled={isAnalyzing || !manualBarcode.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
                    <div className="w-64 h-32 border-4 border-primary/40 rounded-lg">
                      <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-primary/40"></div>
                      <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-primary/40"></div>
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-primary/40"></div>
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-primary/40"></div>
                    </div>
                  </div>
                </div>

                <p className="text-center text-foreground">Position the barcode within the frame</p>

                <div className="flex space-x-3">
                  <Button
                    onClick={simulateBarcodeDetection}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    Simulate Scan
                  </Button>
                  <Button
                    onClick={stopScanner}
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {scannedProduct && (
              <div className="space-y-4">
                <Card className="border-primary/20 bg-accent/50">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-primary" />
                      <CardTitle className="text-foreground">{scannedProduct.name}</CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground">{scannedProduct.brand}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="font-semibold text-foreground">{scannedProduct.calories}</div>
                        <div className="text-muted-foreground">Calories</div>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="font-semibold text-foreground">{scannedProduct.protein}g</div>
                        <div className="text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="font-semibold text-foreground">{scannedProduct.carbs}g</div>
                        <div className="text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="font-semibold text-foreground">{scannedProduct.fat}g</div>
                        <div className="text-muted-foreground">Fat</div>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="font-semibold text-foreground">{scannedProduct.fiber}g</div>
                        <div className="text-muted-foreground">Fiber</div>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <div className="font-semibold text-foreground">{scannedProduct.sugar}g</div>
                        <div className="text-muted-foreground">Sugar</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Ingredients</h4>
                      <p className="text-sm text-foreground">{scannedProduct.ingredients.join(", ")}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-3">
                  <Button
                    onClick={analyzeProduct}
                    disabled={isAnalyzing}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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
                    className="border-primary/30 text-primary hover:bg-primary/5"
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
        <Card className="mt-6 border-primary/20 bg-accent/50">
          <CardHeader>
            <CardTitle className="text-foreground">🎯 Try These Demo Barcodes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Test the scanner with these sample products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(mockBarcodeDatabase).map(([barcode, product]) => (
                <div key={barcode} className="flex items-center justify-between p-2 bg-background rounded">
                  <div>
                    <span className="font-mono text-sm text-foreground">{barcode}</span>
                    <span className="ml-3 text-muted-foreground">{product.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setManualBarcode(barcode)
                      processBarcode(barcode)
                    }}
                    className="border-primary/30 text-primary hover:bg-primary/5"
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
