"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"

interface Profile {
  id: string
  name: string
  email: string
  weight_kg: number | null
  height_cm: number | null
  age: number | null
  gender: string | null
  activity_level: string | null
  dietary_restrictions: string[] | null
  health_goals: string[] | null
  allergies: string[] | null
  medical_conditions: string[] | null
}

const dietaryOptions = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "low-carb",
  "keto",
  "paleo",
  "halal",
  "kosher",
]

const healthGoalOptions = [
  "weight_loss",
  "weight_gain",
  "muscle_gain",
  "maintain_weight",
  "improve_energy",
  "better_digestion",
  "heart_health",
  "diabetes_management",
]

const commonAllergies = ["peanuts", "tree_nuts", "milk", "eggs", "wheat", "soy", "fish", "shellfish"]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          weight_kg: profile.weight_kg,
          height_cm: profile.height_cm,
          age: profile.age,
          gender: profile.gender,
          activity_level: profile.activity_level,
          dietary_restrictions: profile.dietary_restrictions,
          health_goals: profile.health_goals,
          allergies: profile.allergies,
          medical_conditions: profile.medical_conditions,
        })
        .eq("id", profile.id)

      if (error) throw error
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setError("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleArrayChange = (field: keyof Profile, value: string, checked: boolean) => {
    if (!profile) return

    const currentArray = (profile[field] as string[]) || []
    let newArray

    if (checked) {
      newArray = [...currentArray, value]
    } else {
      newArray = currentArray.filter((item) => item !== value)
    }

    setProfile({ ...profile, [field]: newArray })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 flex items-center justify-center">
        <div className="text-primary-foreground">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 flex items-center justify-center">
        <div className="text-destructive">Failed to load profile</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
      <Header showBack backHref="/dashboard" title="Your Profile" subtitle="Personalize your food journey! 🎯" />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">✨ Basic Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Tell us about yourself so we can create magic together!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input id="email" value={profile.email || ""} disabled className="border-border bg-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Physical Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Help us provide personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-foreground">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: Number.parseInt(e.target.value) || null })}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground">
                    Gender
                  </Label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger className="border-border focus:border-primary">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-foreground">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={profile.weight_kg || ""}
                    onChange={(e) => setProfile({ ...profile, weight_kg: Number.parseFloat(e.target.value) || null })}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height_cm || ""}
                    onChange={(e) => setProfile({ ...profile, height_cm: Number.parseFloat(e.target.value) || null })}
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity" className="text-foreground">
                  Activity Level
                </Label>
                <Select
                  value={profile.activity_level || ""}
                  onValueChange={(value) => setProfile({ ...profile, activity_level: value })}
                >
                  <SelectTrigger className="border-border focus:border-primary">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">
                      Moderately Active (moderate exercise 3-5 days/week)
                    </SelectItem>
                    <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="extremely_active">
                      Extremely Active (very hard exercise, physical job)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dietary Preferences */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Dietary Preferences</CardTitle>
              <CardDescription className="text-muted-foreground">
                Select any dietary restrictions or preferences you follow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {dietaryOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={(profile.dietary_restrictions || []).includes(option)}
                      onCheckedChange={(checked) =>
                        handleArrayChange("dietary_restrictions", option, checked as boolean)
                      }
                    />
                    <Label htmlFor={option} className="text-foreground capitalize">
                      {option.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Goals */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Health Goals</CardTitle>
              <CardDescription className="text-muted-foreground">
                What are your primary health and fitness goals?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {healthGoalOptions.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={(profile.health_goals || []).includes(goal)}
                      onCheckedChange={(checked) => handleArrayChange("health_goals", goal, checked as boolean)}
                    />
                    <Label htmlFor={goal} className="text-foreground capitalize">
                      {goal.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Food Allergies</CardTitle>
              <CardDescription className="text-muted-foreground">
                Select any food allergies you have for safety recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {commonAllergies.map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={(profile.allergies || []).includes(allergy)}
                      onCheckedChange={(checked) => handleArrayChange("allergies", allergy, checked as boolean)}
                    />
                    <Label htmlFor={allergy} className="text-foreground capitalize">
                      {allergy.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical Conditions */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Medical Conditions</CardTitle>
              <CardDescription className="text-muted-foreground">
                List any medical conditions that affect your diet (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter medical conditions separated by commas (e.g., diabetes, hypertension, heart disease)"
                value={(profile.medical_conditions || []).join(", ")}
                onChange={(e) => {
                  const conditions = e.target.value
                    .split(",")
                    .map((c) => c.trim())
                    .filter((c) => c)
                  setProfile({ ...profile, medical_conditions: conditions })
                }}
                className="border-border focus:border-primary"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
                  🎉 Profile saved successfully!
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Profile ✨"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
