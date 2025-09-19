import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Search, Scan, User, History, Settings } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
      <Header title="Dashboard" subtitle={`Welcome back, ${profile?.name || "Food Explorer"}! 🍽️`} />

      <div className="container mx-auto px-6 py-8">
        {/* Profile Completion Alert */}
        {!isProfileComplete && (
          <Card className="mb-8 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center">
                <Settings className="w-5 h-5 mr-2" />🚀 Supercharge Your Food Journey!
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Complete your profile to unlock personalized AI recommendations tailored just for you!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile">
                <Button className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white">
                  Complete Profile ✨
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/scan/camera">
            <Card className="border-primary/20 hover:shadow-lg transition-all cursor-pointer hover:border-primary/40 hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-foreground">📸 AI Camera Scan</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Snap any food and let AI work its magic instantly!
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/scan/search">
            <Card className="border-primary/20 hover:shadow-lg transition-all cursor-pointer hover:border-primary/40 hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-foreground">🔍 Smart Food Search</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Search our database of 1000+ foods for instant insights
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/scan/barcode">
            <Card className="border-primary/20 hover:shadow-lg transition-all cursor-pointer hover:border-primary/40 hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Scan className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-foreground">📦 Barcode Scanner</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Decode packaged foods with lightning-fast barcode scanning
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <History className="w-5 h-5 mr-2" />🕒 Your Food Journey
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Track your latest discoveries and health wins
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentScans && recentScans.length > 0 ? (
              <div className="space-y-4">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${scan.is_recommended ? "bg-green-500" : "bg-red-500"}`} />
                      <div>
                        <p className="font-medium text-foreground">{scan.food_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{scan.scan_type} scan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${scan.is_recommended ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                      >
                        {scan.is_recommended ? "✅ Recommended" : "⚠️ Not Recommended"}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(scan.scanned_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">🌟 Ready to start your food adventure?</p>
                <Link href="/scan/camera">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Your First Food! 🚀
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Profile Access */}
        <div className="mt-6 text-center">
          <Link href="/profile">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 bg-transparent">
              <User className="w-4 h-4 mr-2" />
              Manage Your Profile 👤
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
