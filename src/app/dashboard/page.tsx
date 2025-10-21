"use client"

import { useSession } from "@/lib/client-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Clock, Target, Trophy, BookOpen, Zap, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userStats, setUserStats] = useState({
    points: 0,
    streak: 0,
    questionsAsked: 0,
    focusMinutes: 0,
    weakTopics: 0,
    reviewsDue: 0
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch user stats
      fetchUserStats()
    }
  }, [status])

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/user/stats")
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session.user?.name || "Learner"}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Streak</p>
              <p className="text-2xl font-bold text-orange-600">{userStats.streak} 🔥</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-2xl font-bold text-purple-600">{userStats.points}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/ai-tutor">
            <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              <Brain className="w-6 h-6" />
              <span>Ask AI</span>
            </Button>
          </Link>
          <Link href="/focus">
            <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Clock className="w-6 h-6" />
              <span>Focus Timer</span>
            </Button>
          </Link>
          <Link href="/review">
            <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              <BookOpen className="w-6 h-6" />
              <span>Review ({userStats.reviewsDue})</span>
            </Button>
          </Link>
          <Link href="/progress">
            <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
              <TrendingUp className="w-6 h-6" />
              <span>Progress</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.questionsAsked}</div>
              <p className="text-xs text-muted-foreground">
                +20% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Minutes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.focusMinutes}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weak Topics</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.weakTopics}</div>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity & Weak Topics */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium">Asked about Physics</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">25 min focus session</p>
                  <p className="text-sm text-gray-600">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Reviewed 5 flashcards</p>
                  <p className="text-sm text-gray-600">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Weak Topics to Review
            </CardTitle>
            <CardDescription>
              Topics that need more practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">Physics - Motion</p>
                  <p className="text-sm text-gray-600">5 questions asked</p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Math - Calculus</p>
                  <p className="text-sm text-gray-600">3 questions asked</p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Chemistry - Organic</p>
                  <p className="text-sm text-gray-600">2 questions asked</p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}