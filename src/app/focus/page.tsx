"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Play, Pause, RotateCcw, Eye, EyeOff, Trophy, Zap } from "lucide-react"
import Link from "next/link"

interface FocusSession {
  id: string
  duration: number
  distractions: number
  completed: boolean
  pointsEarned: number
  startTime: Date
  endTime?: Date
}

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [distractions, setDistractions] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  // Focus detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isRunning && !document.hidden) {
        setIsVisible(true)
      } else if (isRunning && document.hidden) {
        setIsVisible(false)
        setDistractions(prev => prev + 1)
      }
    }

    const handleBlur = () => {
      if (isRunning) {
        setDistractions(prev => prev + 1)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleBlur)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleBlur)
    }
  }, [isRunning])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleSessionComplete = async () => {
    setIsRunning(false)
    const completed = !isBreak
    
    if (completed) {
      // Calculate points (base points minus distraction penalty)
      const basePoints = 50
      const distractionPenalty = Math.min(distractions * 5, 20)
      const pointsEarned = Math.max(basePoints - distractionPenalty, 10)

      // Save session to database
      try {
        const response = await fetch("/api/focus/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duration: 25,
            distractions,
            completed,
            pointsEarned,
            startTime: startTimeRef.current?.toISOString()
          })
        })

        if (response.ok) {
          const newSession = await response.json()
          setSessions(prev => [newSession, ...prev])
        }
      } catch (error) {
        console.error("Failed to save session:", error)
      }

      // Show completion message
      alert(`Great job! You earned ${pointsEarned} points!`)
    }

    // Switch to break or back to work
    if (!isBreak) {
      setIsBreak(true)
      setTimeLeft(5 * 60) // 5 minute break
    } else {
      setIsBreak(false)
      setTimeLeft(25 * 60) // 25 minute work session
      setDistractions(0)
    }
  }

  const startSession = () => {
    if (!sessionActive) {
      setSessionActive(true)
      startTimeRef.current = new Date()
    }
    setIsRunning(true)
  }

  const pauseSession = () => {
    setIsRunning(false)
  }

  const resetSession = () => {
    setIsRunning(false)
    setSessionActive(false)
    setTimeLeft(25 * 60)
    setIsBreak(false)
    setDistractions(0)
    startTimeRef.current = null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    const today = new Date()
    return sessionDate.toDateString() === today.toDateString()
  })

  const totalFocusTime = todaySessions.reduce((sum, session) => sum + session.duration, 0)
  const totalPoints = todaySessions.reduce((sum, session) => sum + session.pointsEarned, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-8 h-8 text-blue-600" />
              Focus Timer
            </h1>
            <p className="text-gray-600 mt-1">
              Stay focused with Pomodoro technique and track distractions
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="md:col-span-2">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                {isBreak ? "☕ Break Time" : "🎯 Focus Session"}
                {!isVisible && <EyeOff className="w-5 h-5 text-red-500" />}
              </CardTitle>
              <CardDescription>
                {isBreak 
                  ? "Relax and recharge for the next session" 
                  : "Stay focused on your task. Avoid distractions!"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="relative">
                <div className={`text-7xl font-bold font-mono ${
                  isBreak ? "text-green-600" : "text-blue-600"
                }`}>
                  {formatTime(timeLeft)}
                </div>
                
                {/* Progress Ring */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        isBreak ? "bg-green-600" : "bg-blue-600"
                      }`}
                      style={{
                        width: `${((isBreak ? 5*60 : 25*60) - timeLeft) / (isBreak ? 5*60 : 25*60) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center gap-4">
                {!isRunning ? (
                  <Button 
                    onClick={startSession}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button 
                    onClick={pauseSession}
                    size="lg"
                    variant="outline"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                )}
                <Button 
                  onClick={resetSession}
                  size="lg"
                  variant="outline"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Distraction Counter */}
              {sessionActive && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Eye className="w-5 h-5 text-orange-600" />
                    <span className="text-lg font-semibold text-orange-800">
                      Distractions: {distractions}
                    </span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">
                    Each distraction reduces your points
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Today's Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalFocusTime}</p>
                <p className="text-sm text-gray-600">Minutes Focused</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{totalPoints}</p>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{todaySessions.length}</p>
                <p className="text-sm text-gray-600">Sessions Completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Focus Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Stay Visible</p>
                <p className="text-xs text-blue-700">
                  Keep this tab visible to avoid distraction counts
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Take Breaks</p>
                <p className="text-xs text-green-700">
                  Use breaks to rest your mind and prepare for next session
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900">Earn Points</p>
                <p className="text-xs text-purple-700">
                  Complete sessions without distractions for maximum points
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          {todaySessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todaySessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between">
                        <span>{session.duration} min</span>
                        <span className="text-green-600">+{session.pointsEarned} pts</span>
                      </div>
                      {session.distractions > 0 && (
                        <p className="text-xs text-orange-600">
                          {session.distractions} distractions
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}