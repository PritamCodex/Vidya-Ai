import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // ✅ Create or get the demo user
    const user = await db.user.upsert({
      where: { email: "demo@vidya-ai.com" },
      update: {},
      create: {
        id: "demo-user-id",
        email: "demo@vidya-ai.com",
        name: "Demo Student",
        points: 150,
        streak: 3,
        lastStudyDate: new Date()
      }
    })

    // ✅ Optional: clear existing demo data to avoid duplicates
    await db.question.deleteMany({ where: { userId: user.id } })
    await db.focusSession.deleteMany({ where: { userId: user.id } })
    await db.spacedRepetition.deleteMany({ where: { userId: user.id } })

    // ✅ Sample questions
    const sampleQuestions = [
      {
        userId: user.id,
        question: "What is Newton's second law of motion?",
        answer:
          "Newton's second law states that the force acting on an object is equal to the mass of that object times its acceleration (F = ma).",
        topic: "Physics",
        subtopic: "Mechanics",
        difficulty: 2
      },
      {
        userId: user.id,
        question: "How do you calculate the derivative of x²?",
        answer:
          "The derivative of x² with respect to x is 2x. This follows from the power rule of differentiation.",
        topic: "Mathematics",
        subtopic: "Calculus",
        difficulty: 3
      },
      {
        userId: user.id,
        question: "What is photosynthesis?",
        answer:
          "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen, using chlorophyll.",
        topic: "Biology",
        subtopic: "Plant Biology",
        difficulty: 1
      }
    ]

    // ✅ Insert questions safely
    for (const q of sampleQuestions) {
      try {
        await db.question.create({ data: q })
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`Skipping duplicate question: ${q.question}`)
        } else {
          throw error
        }
      }
    }

    // ✅ Sample focus sessions
    const focusSessions = [
      {
        userId: user.id,
        duration: 25,
        distractions: 1,
        completed: true,
        pointsEarned: 45,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000)
      },
      {
        userId: user.id,
        duration: 25,
        distractions: 0,
        completed: true,
        pointsEarned: 50,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000)
      }
    ]

    for (const session of focusSessions) {
      await db.focusSession.create({ data: session })
    }

    // ✅ Sample spaced repetition cards
    const repetitionCards = [
      {
        userId: user.id,
        topic: "Physics",
        question: "What is Newton's second law of motion?",
        answer:
          "Newton's second law states that the force acting on an object is equal to the mass of that object times its acceleration (F = ma).",
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date()
      },
      {
        userId: user.id,
        topic: "Mathematics",
        question: "How do you calculate the derivative of x²?",
        answer:
          "The derivative of x² with respect to x is 2x. This follows from the power rule of differentiation.",
        interval: 3,
        repetitions: 1,
        easeFactor: 2.6,
        nextReviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    ]

    for (const card of repetitionCards) {
      try {
        await db.spacedRepetition.create({ data: card })
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`Skipping duplicate spaced repetition: ${card.question}`)
        } else {
          throw error
        }
      }
    }

    // ✅ Done
    return NextResponse.json({
      success: true,
      message: "Demo data created successfully",
      user: {
        name: user.name,
        email: user.email,
        points: user.points,
        streak: user.streak
      }
    })
  } catch (error) {
    console.error("Error setting up demo data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to set up demo data" },
      { status: 500 }
    )
  }
}
