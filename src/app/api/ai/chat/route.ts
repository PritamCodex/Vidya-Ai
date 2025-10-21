import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { question } = await request.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 })
    }

    // Initialize ZAI
    const zai = await ZAI.create()

    // Get AI response with topic detection
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful AI tutor for students. Provide clear, educational answers to questions. 
          
          After your answer, identify the main topic and subtopic of the question in this format:
          TOPIC: [Main subject area, e.g., Physics, Mathematics, Chemistry, Biology, History, etc.]
          SUBTOPIC: [Specific topic within the subject, e.g., Motion, Calculus, Organic Chemistry, etc.]
          
          Keep answers concise but comprehensive. Use examples when helpful.`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't answer that question."

    // Extract topic and subtopic
    const topicMatch = aiResponse.match(/TOPIC:\s*(.+)/i)
    const subtopicMatch = aiResponse.match(/SUBTOPIC:\s*(.+)/i)
    
    const topic = topicMatch ? topicMatch[1].trim() : "General"
    const subtopic = subtopicMatch ? subtopicMatch[1].trim() : undefined

    // Clean the response by removing the topic lines
    const cleanAnswer = aiResponse
      .replace(/TOPIC:\s*.+/gi, "")
      .replace(/SUBTOPIC:\s*.+/gi, "")
      .trim()

    // Save question and answer to database
    await db.question.create({
      data: {
        userId: session.user.id,
        question,
        answer: cleanAnswer,
        topic,
        subtopic,
        difficulty: 1 // Default difficulty
      }
    })

    // Award points to user
    await db.user.update({
      where: { id: session.user.id },
      data: {
        points: { increment: 5 },
        lastStudyDate: new Date()
      }
    })

    return NextResponse.json({
      answer: cleanAnswer,
      topic,
      subtopic
    })

  } catch (error) {
    console.error("Error in AI chat:", error)
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    )
  }
}