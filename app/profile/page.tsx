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
import { ArrowLeft, Save, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-emerald-600">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-red-600">Failed to load profile</div>
      </div>
    )
  }

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
              <User className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-emerald-800">Your Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Basic Information</CardTitle>
              <CardDescription className="text-emerald-600">
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-emerald-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-emerald-700">
                    Email
                  </Label>
                  <Input id="email" value={profile.email || ""} disabled className="border-emerald-200 bg-emerald-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Information */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Physical Information</CardTitle>
              <CardDescription className="text-emerald-600">
                Help us provide personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-emerald-700">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: Number.parseInt(e.target.value) || null })}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-emerald-700">
                    Gender
                  </Label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
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
                  <Label htmlFor="weight" className="text-emerald-700">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={profile.weight_kg || ""}
                    onChange={(e) => setProfile({ ...profile, weight_kg: Number.parseFloat(e.target.value) || null })}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-emerald-700">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height_cm || ""}
                    onChange={(e) => setProfile({ ...profile, height_cm: Number.parseFloat(e.target.value) || null })}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity" className="text-emerald-700">
                  Activity Level
                </Label>
                <Select
                  value={profile.activity_level || ""}
                  onValueChange={(value) => setProfile({ ...profile, activity_level: value })}
                >
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
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
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Dietary Preferences</CardTitle>
              <CardDescription className="text-emerald-600">
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
                    <Label htmlFor={option} className="text-emerald-700 capitalize">
                      {option.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Goals */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Health Goals</CardTitle>
              <CardDescription className="text-emerald-600">
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
                    <Label htmlFor={goal} className="text-emerald-700 capitalize">
                      {goal.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Food Allergies</CardTitle>
              <CardDescription className="text-emerald-600">
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
                    <Label htmlFor={allergy} className="text-emerald-700 capitalize">
                      {allergy.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical Conditions */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Medical Conditions</CardTitle>
              <CardDescription className="text-emerald-600">
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
                className="border-emerald-200 focus:border-emerald-400"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
              )}
              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                  Profile saved successfully!
                </div>
              )}
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
