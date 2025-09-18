import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Search, Scan, Sparkles, Shield, Star, TrendingUp } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Foodle Logo" width={40} height={40} className="rounded-lg" />
            <h1 className="text-2xl font-bold text-primary">Foodle</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">Stop Playing Food Roulette! 🎰</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Whether it's that tempting samosa or mysterious street chaat, Foodle's got your back! Scan any Indian
            delicacy and discover if it's your health buddy or frenemy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Start Your Food Adventure 🚀
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Creative Food Images Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image
              src="/delicious-indian-samosa-with-mint-chutney.jpg"
              alt="Indian Samosa"
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image
              src="/colorful-indian-street-food-chaat.jpg"
              alt="Street Chaat"
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image
              src="/traditional-indian-thali-with-various-dishes.jpg"
              alt="Indian Thali"
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image
              src="/indian-sweets-and-desserts-mithai.jpg"
              alt="Indian Sweets"
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Three Ways to Decode Your Food</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From your mom's homemade dal to that fancy restaurant biryani - we've got every Indian food covered!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-primary/20 hover:shadow-lg transition-all hover:border-primary/40">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">📸 Snap & Analyze</CardTitle>
              <CardDescription className="text-muted-foreground">
                Point, shoot, and let our AI work its magic on any food
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                From golgappa to gulab jamun - our AI recognizes over 1000+ Indian foods and gives you the health scoop
                instantly!
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-all hover:border-primary/40">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">🔍 Search & Discover</CardTitle>
              <CardDescription className="text-muted-foreground">
                Type any Indian dish name and get the complete health breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Curious about that "Pav Bhaji" or "Masala Dosa"? Just search and discover if it fits your health goals!
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-all hover:border-primary/40">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Scan className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">📦 Barcode Magic</CardTitle>
              <CardDescription className="text-muted-foreground">
                Scan packaged foods for instant ingredient analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                That packet of namkeen or chocolate bar? Scan the barcode and know exactly what you're putting in your
                body!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Health Score Preview */}
      <section className="bg-primary/5 dark:bg-primary/10 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Meet Your Food's Health Score! 📊</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every food gets a personalized health score based on YOUR unique profile. No more guessing games!
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image src="/indian-samosa-golden-crispy.jpg" alt="Samosa" fill className="object-cover rounded-full" />
                </div>
                <CardTitle className="text-foreground">Samosa Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-4xl font-bold text-orange-500">6.2</div>
                  <div className="text-sm text-muted-foreground ml-2">/10</div>
                </div>
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5, 6].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                  {[7, 8, 9, 10].map((star) => (
                    <Star key={star} className="w-4 h-4 text-gray-300" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "Tasty but go easy! High in calories for your weight loss goal. Maybe save it for cheat day? 😉"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Why Foodle is Your Food BFF? 🤝</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">AI That Gets Indian Food</h4>
              <p className="text-muted-foreground text-sm">
                Trained on thousands of Indian dishes - from your local dhaba to 5-star restaurants. We speak food
                fluently!
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Your Secrets Are Safe</h4>
              <p className="text-muted-foreground text-sm">
                We guard your health data like a secret family recipe. Encrypted, secure, and never shared!
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Personalized Just for You</h4>
              <p className="text-muted-foreground text-sm">
                Your age, weight, goals, allergies - we factor it all in. It's like having a nutritionist in your
                pocket!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to Become a Food Detective? 🕵️</h3>
          <p className="text-muted-foreground mb-8">
            Join thousands of Indians who've already cracked the code to healthier eating without giving up their
            favorite foods!
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              Start Your Food Journey - It's Free! 🎉
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image src="/logo.png" alt="Foodle Logo" width={24} height={24} className="rounded" />
            <span className="text-lg font-semibold">Foodle</span>
          </div>
          <p className="text-primary-foreground/80 text-sm">
            © 2024 Foodle. Making Indian food choices smarter, one scan at a time! 🍛
          </p>
        </div>
      </footer>
    </div>
  )
}
