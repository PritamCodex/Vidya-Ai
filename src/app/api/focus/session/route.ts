import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { duration, distractions, completed, pointsEarned, startTime } = await request.json()

    // Create focus session
    const focusSession = await db.focusSession.create({
      data: {
        userId: session.user.id,
        duration,
        distractions: distractions || 0,
        completed,
        pointsEarned: pointsEarned || 0,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: new Date()
      }
    })

    // Update user points and streak
    await db.user.update({
      where: { id: session.user.id },
      data: {
        points: { increment: pointsEarned || 0 },
        lastStudyDate: new Date()
      }
    })

    // Check and update streak
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { lastStudyDate: true, streak: true }
    })

    if (user) {
      const today = new Date()
      const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null
      
      if (lastStudy) {
        const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          // Continue streak
          await db.user.update({
            where: { id: session.user.id },
            data: { streak: { increment: 1 } }
          })
        } else if (daysDiff > 1) {
          // Reset streak
          await db.user.update({
            where: { id: session.user.id },
            data: { streak: 1 }
          })
        }
      } else {
        // First study session
        await db.user.update({
          where: { id: session.user.id },
          data: { streak: 1 }
        })
      }
    }

    return NextResponse.json(focusSession)
  } catch (error) {
    console.error("Error saving focus session:", error)
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const focusSessions = await db.focusSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    return NextResponse.json(focusSessions)
  } catch (error) {
    console.error("Error fetching focus sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}