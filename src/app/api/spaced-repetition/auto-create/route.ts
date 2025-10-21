import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get recent questions that haven't been converted to cards
    const recentQuestions = await db.question.findMany({
      where: {
        userId: session.user.id,
        // This would ideally check if the question already has a spaced repetition card
        // For now, we'll get questions from the last 7 days
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    let cardsCreated = 0

    for (const question of recentQuestions) {
      // Check if a card already exists for this question
      const existingCard = await db.spacedRepetition.findFirst({
        where: {
          userId: session.user.id,
          question: question.question
        }
      })

      if (!existingCard) {
        // Create a new spaced repetition card
        await db.spacedRepetition.create({
          data: {
            userId: session.user.id,
            topic: question.topic,
            question: question.question,
            answer: question.answer,
            interval: 1, // Start with 1 day
            repetitions: 0,
            easeFactor: 2.5,
            nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          }
        })
        cardsCreated++
      }
    }

    return NextResponse.json({ 
      message: `Created ${cardsCreated} new review cards`,
      cardsCreated 
    })
  } catch (error) {
    console.error("Error auto-creating cards:", error)
    return NextResponse.json({ error: "Failed to create cards" }, { status: 500 })
  }
}