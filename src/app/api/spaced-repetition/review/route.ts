import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// SM-2 Algorithm implementation
function calculateNextReview(
  interval: number,
  repetitions: number,
  easeFactor: number,
  quality: number
) {
  let newEaseFactor = easeFactor
  let newInterval = interval
  let newRepetitions = repetitions

  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
    newRepetitions = repetitions + 1
  } else {
    newRepetitions = 0
    newInterval = 1
  }

  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextReviewDate
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { cardId, quality } = await request.json()

    if (!cardId || quality < 0 || quality > 5) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Get current card
    const card = await db.spacedRepetition.findUnique({
      where: { id: cardId, userId: session.user.id }
    })

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    // Calculate next review using SM-2 algorithm
    const nextReview = calculateNextReview(
      card.interval,
      card.repetitions,
      card.easeFactor,
      quality
    )

    // Update card
    const updatedCard = await db.spacedRepetition.update({
      where: { id: cardId },
      data: {
        interval: nextReview.interval,
        repetitions: nextReview.repetitions,
        easeFactor: nextReview.easeFactor,
        nextReviewDate: nextReview.nextReviewDate,
        lastReviewDate: new Date(),
        quality
      }
    })

    // Award points to user
    const points = quality >= 3 ? 10 : 5
    await db.user.update({
      where: { id: session.user.id },
      data: {
        points: { increment: points },
        lastStudyDate: new Date()
      }
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error("Error reviewing card:", error)
    return NextResponse.json({ error: "Failed to review card" }, { status: 500 })
  }
}