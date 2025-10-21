import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "week"
    
    const userId = session.user.id
    const now = new Date()
    const startDate = new Date()
    
    if (range === "week") {
      startDate.setDate(now.getDate() - 7)
    } else if (range === "month") {
      startDate.setDate(now.getDate() - 30)
    } else {
      startDate.setDate(now.getDate() - 7)
    }

    // Get daily stats
    const focusSessions = await db.focusSession.findMany({
      where: {
        userId,
        startTime: { gte: startDate }
      },
      select: {
        startTime: true,
        duration: true,
        completed: true
      }
    })

    const questions = await db.question.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        topic: true
      }
    })

    // Group by date
    const dailyStatsMap = new Map<string, {
      focusMinutes: number
      questionsAsked: number
      pointsEarned: number
    }>()

    // Initialize all days in range
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      dailyStatsMap.set(dateKey, {
        focusMinutes: 0,
        questionsAsked: 0,
        pointsEarned: 0
      })
    }

    // Add focus sessions
    focusSessions.forEach(session => {
      const dateKey = session.startTime.toISOString().split('T')[0]
      const current = dailyStatsMap.get(dateKey) || {
        focusMinutes: 0,
        questionsAsked: 0,
        pointsEarned: 0
      }
      current.focusMinutes += session.duration
      current.pointsEarned += session.pointsEarned
      dailyStatsMap.set(dateKey, current)
    })

    // Add questions
    questions.forEach(question => {
      const dateKey = question.createdAt.toISOString().split('T')[0]
      const current = dailyStatsMap.get(dateKey) || {
        focusMinutes: 0,
        questionsAsked: 0,
        pointsEarned: 0
      }
      current.questionsAsked += 1
      current.pointsEarned += 5 // 5 points per question
      dailyStatsMap.set(dateKey, current)
    })

    const dailyStats = Array.from(dailyStatsMap.entries()).map(([date, stats]) => ({
      date,
      ...stats
    }))

    // Get topic distribution
    const topicCounts = await db.question.groupBy({
      by: ['topic'],
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      _count: { topic: true }
    })

    const topicDistribution = topicCounts.map(item => ({
      topic: item.topic,
      count: item._count.topic
    }))

    // Get weak topics (3+ questions)
    const weakTopicsData = topicCounts
      .filter(item => item._count.topic >= 3)
      .map(item => ({
        topic: item.topic,
        count: item._count.topic,
        difficulty: 3 // Default difficulty
      }))

    // Calculate weekly summary
    const totalFocusTime = focusSessions.reduce((sum, session) => sum + session.duration, 0)
    const totalQuestions = questions.length
    const completedSessions = focusSessions.filter(s => s.completed).length
    const totalPoints = focusSessions.reduce((sum, session) => sum + session.pointsEarned, 0) + (totalQuestions * 5)
    const averageSessionLength = completedSessions > 0 ? Math.round(totalFocusTime / completedSessions) : 0

    // Get current streak
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { streak: true }
    })

    const weeklySummary = {
      totalFocusTime,
      totalQuestions,
      totalPoints,
      currentStreak: user?.streak || 0,
      averageSessionLength
    }

    return NextResponse.json({
      dailyStats,
      topicDistribution,
      weeklySummary,
      weakTopics: weakTopicsData
    })

  } catch (error) {
    console.error("Error fetching progress data:", error)
    return NextResponse.json({ error: "Failed to fetch progress data" }, { status: 500 })
  }
}