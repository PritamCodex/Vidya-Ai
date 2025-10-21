"use client"

import { useSession } from "@/lib/client-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Clock, Target, Trophy, Zap, BookOpen } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const setupDemoData = async () => {
    try {
      const response = await fetch("/api/demo/setup", {
        method: "POST"
      })
      if (response.ok) {
        console.log("Demo data created successfully")
      }
    } catch (error) {
      console.error("Failed to setup demo data:", error)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      setupDemoData()
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Vidya AI
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your AI-powered personal learning assistant. Study smarter with spaced repetition, 
              focus tracking, and intelligent doubt solving.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Doubt Solver
                </CardTitle>
                <CardDescription>
                  Get instant answers to your questions with AI-powered explanations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Weak Topic Tracking
                </CardTitle>
                <CardDescription>
                  Automatically identify topics you need more practice with
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Spaced Repetition
                </CardTitle>
                <CardDescription>
                  Review concepts at optimal intervals using proven algorithms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Focus Tracker
                </CardTitle>
                <CardDescription>
                  Pomodoro timer with distraction detection and session logging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Gamification
                </CardTitle>
                <CardDescription>
                  Earn points, maintain streaks, and unlock achievements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-600" />
                  Progress Reports
                </CardTitle>
                <CardDescription>
                  Weekly insights and learning analytics with charts
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
              onClick={() => router.push("/dashboard")}
            >
              Start Learning Now
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Free to use • No credit card required
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}