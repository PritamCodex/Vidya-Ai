"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Calendar, 
  Brain, 
  Clock, 
  Target, 
  Trophy,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from "recharts"

interface ProgressData {
  dailyStats: Array<{
    date: string
    focusMinutes: number
    questionsAsked: number
    pointsEarned: number
  }>
  topicDistribution: Array<{
    topic: string
    count: number
  }>
  weeklySummary: {
    totalFocusTime: number
    totalQuestions: number
    totalPoints: number
    currentStreak: number
    averageSessionLength: number
  }
  weakTopics: Array<{
    topic: string
    count: number
    difficulty: number
  }>
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function Progress() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("week")

  useEffect(() => {
    fetchProgressData()
  }, [timeRange])

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`/api/progress?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setProgressData(data)
      }
    } catch (error) {
      console.error("Failed to fetch progress data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Progress Tracking</h1>
          <p className="text-gray-600">Unable to load progress data. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              Progress Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Track your learning journey and identify areas for improvement
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={timeRange === "week" ? "default" : "outline"}
              onClick={() => setTimeRange("week")}
            >
              Week
            </Button>
            <Button 
              variant={timeRange === "month" ? "default" : "outline"}
              onClick={() => setTimeRange("month")}
            >
              Month
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.weeklySummary.totalFocusTime}m</div>
              <p className="text-xs text-muted-foreground">
                Avg: {progressData.weeklySummary.averageSessionLength}m per session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.weeklySummary.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                This {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.weeklySummary.totalPoints}</div>
              <p className="text-xs text-muted-foreground">
                Keep it up!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.weeklySummary.currentStreak} 🔥</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
        {/* Daily Activity Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daily Activity
            </CardTitle>
            <CardDescription>
              Your focus time and questions asked over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                    value,
                    name === "focusMinutes" ? "Focus Minutes" : "Questions Asked"
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="focusMinutes" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="questionsAsked" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Topic Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Topic Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of questions by subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={progressData.topicDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ topic, percent }) => `${topic} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {progressData.topicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weak Topics */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Weak Topics
            </CardTitle>
            <CardDescription>
              Topics that need more practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.weakTopics.length > 0 ? (
                progressData.weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">{topic.topic}</p>
                      <p className="text-sm text-red-700">
                        {topic.count} questions asked • Difficulty: {topic.difficulty}/5
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Practice
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No weak topics identified yet!</p>
                  <p className="text-sm mt-1">Keep asking questions to see your learning patterns.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Your latest accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Week Warrior</p>
                  <p className="text-sm text-yellow-700">7-day study streak achieved!</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Brain className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Knowledge Seeker</p>
                  <p className="text-sm text-purple-700">Asked 50 questions!</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Focus Master</p>
                  <p className="text-sm text-blue-700">10 hours of focused study!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}