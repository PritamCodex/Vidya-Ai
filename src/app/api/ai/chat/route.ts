import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    let session = await getServerSession(authOptions)

    // ✅ In dev, use demo user if no session exists
    if (!session?.user?.id && process.env.NODE_ENV === "development") {
      const demoUser = await db.user.findUnique({
        where: { email: "demo@vidya-ai.com" }
      })
      if (!demoUser) {
        return NextResponse.json({ error: "Demo user not found" }, { status: 404 })
      }
      session = { user: { id: demoUser.id } } as any
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { question } = await request.json()
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 })
    }

    // ✅ Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })


    const prompt = `
You are a helpful AI tutor for students. Provide clear, educational answers to questions.

After your answer, identify the main topic and subtopic of the question in this format:
TOPIC: [Main subject area]
SUBTOPIC: [Specific subtopic]

Keep answers concise but comprehensive. Use examples when helpful.

Question: ${question}
`
    const result = await model.generateContent(prompt)
    const aiResponse = result.response.text()

    const topicMatch = aiResponse.match(/TOPIC:\s*(.+)/i)
    const subtopicMatch = aiResponse.match(/SUBTOPIC:\s*(.+)/i)
    const topic = topicMatch ? topicMatch[1].trim() : "General"
    const subtopic = subtopicMatch ? subtopicMatch[1].trim() : undefined

    const cleanAnswer = aiResponse
      .replace(/TOPIC:\s*.+/gi, "")
      .replace(/SUBTOPIC:\s*.+/gi, "")
      .trim()

    await db.question.create({
      data: {
        userId: session.user.id,
        question,
        answer: cleanAnswer,
        topic,
        subtopic,
        difficulty: 1
      }
    })

    await db.user.update({
      where: { id: session.user.id },
      data: {
        points: { increment: 5 },
        lastStudyDate: new Date()
      }
    })

    return NextResponse.json({ answer: cleanAnswer, topic, subtopic })
  } catch (error) {
    console.error("Error in Gemini chat:", error)
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 })
  }
}
