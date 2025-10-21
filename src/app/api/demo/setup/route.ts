import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // Create demo user
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

    // Create sample questions
    const sampleQuestions = [
      {
        userId: user.id,
        question: "What is Newton's second law of motion?",
        answer: "Newton's second law states that the force acting on an object is equal to the mass of that object times its acceleration (F = ma).",
        topic: "Physics",
        subtopic: "Mechanics",
        difficulty: 2
      },
      {
        userId: user.id,
        question: "How do you calculate the derivative of x²?",
        answer: "The derivative of x² with respect to x is 2x. This follows from the power rule of differentiation.",
        topic: "Mathematics",
        subtopic: "Calculus",
        difficulty: 3
      },
      {
        userId: user.id,
        question: "What is photosynthesis?",
        answer: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen, using chlorophyll.",
        topic: "Biology",
        subtopic: "Plant Biology",
        difficulty: 1
      }
    ]

    for (const question of sampleQuestions) {
      await db.question.create({
        data: question
      })
    }

    // Create sample focus sessions
    const focusSessions = [
      {
        userId: user.id,
        duration: 25,
        distractions: 1,
        completed: true,
        pointsEarned: 45,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000)
      },
      {
        userId: user.id,
        duration: 25,
        distractions: 0,
        completed: true,
        pointsEarned: 50,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000)
      }
    ]

    for (const session of focusSessions) {
      await db.focusSession.create({
        data: session
      })
    }

    // Create sample spaced repetition cards
    const repetitionCards = [
      {
        userId: user.id,
        topic: "Physics",
        question: "What is Newton's second law of motion?",
        answer: "Newton's second law states that the force acting on an object is equal to the mass of that object times its acceleration (F = ma).",
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date()
      },
      {
        userId: user.id,
        topic: "Mathematics",
        question: "How do you calculate the derivative of x²?",
        answer: "The derivative of x² with respect to x is 2x. This follows from the power rule of differentiation.",
        interval: 3,
        repetitions: 1,
        easeFactor: 2.6,
        nextReviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    ]

    for (const card of repetitionCards) {
      await db.spacedRepetition.create({
        data: card
      })
    }

    return NextResponse.json({ 
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
    return NextResponse.json({ error: "Failed to setup demo data" }, { status: 500 })
  }
}