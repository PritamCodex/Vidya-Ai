import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { points: true, streak: true }
    })

    // Count questions
    const questionsCount = await db.question.count({
      where: { userId }
    })

    // Calculate total focus minutes
    const focusSessions = await db.focusSession.findMany({
      where: { userId, completed: true },
      select: { duration: true }
    })
    const focusMinutes = focusSessions.reduce((sum, session) => sum + session.duration, 0)

    // Count weak topics (topics with 3+ questions)
    const topicCounts = await db.question.groupBy({
      by: ['topic'],
      where: { userId },
      _count: { topic: true }
    })
    const weakTopics = topicCounts.filter(topic => topic._count.topic >= 3).length

    // Count due reviews
    const dueReviews = await db.spacedRepetition.count({
      where: {
        userId,
        nextReviewDate: { lte: new Date() }
      }
    })

    const stats = {
      points: user?.points || 0,
      streak: user?.streak || 0,
      questionsAsked: questionsCount,
      focusMinutes,
      weakTopics,
      reviewsDue: dueReviews
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}