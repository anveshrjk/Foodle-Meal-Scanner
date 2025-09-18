import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Search, Scan, User, History, Settings } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get recent scans
  const { data: recentScans } = await supabase
    .from("food_scans")
    .select("*")
    .eq("user_id", data.user.id)
    .order("scanned_at", { ascending: false })
    .limit(5)

  const isProfileComplete = profile && profile.weight_kg && profile.height_cm && profile.age

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-emerald-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-2xl font-bold text-emerald-800">Foodle</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-700">Welcome, {profile?.name || "User"}!</span>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-emerald-700">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Profile Completion Alert */}
        {!isProfileComplete && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-amber-700">
                Add your health information to get personalized food recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Main Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/scan/camera">
            <Card className="border-emerald-200 hover:shadow-lg transition-all cursor-pointer hover:border-emerald-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Camera Scan</CardTitle>
                <CardDescription className="text-emerald-600">
                  Take a photo of your food for instant analysis
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/scan/search">
            <Card className="border-emerald-200 hover:shadow-lg transition-all cursor-pointer hover:border-emerald-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Food Search</CardTitle>
                <CardDescription className="text-emerald-600">Search for food by name in our database</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/scan/barcode">
            <Card className="border-emerald-200 hover:shadow-lg transition-all cursor-pointer hover:border-emerald-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Scan className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Barcode Scanner</CardTitle>
                <CardDescription className="text-emerald-600">Scan product barcodes for packaged foods</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center">
              <History className="w-5 h-5 mr-2" />
              Recent Scans
            </CardTitle>
            <CardDescription className="text-emerald-600">Your latest food analysis history</CardDescription>
          </CardHeader>
          <CardContent>
            {recentScans && recentScans.length > 0 ? (
              <div className="space-y-4">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${scan.is_recommended ? "bg-green-500" : "bg-red-500"}`} />
                      <div>
                        <p className="font-medium text-emerald-800">{scan.food_name}</p>
                        <p className="text-sm text-emerald-600 capitalize">{scan.scan_type} scan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${scan.is_recommended ? "text-green-700" : "text-red-700"}`}>
                        {scan.is_recommended ? "Recommended" : "Not Recommended"}
                      </p>
                      <p className="text-xs text-emerald-500">{new Date(scan.scanned_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-emerald-600 mb-4">No scans yet. Start by scanning your first food!</p>
                <Link href="/scan/camera">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Scanning
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
