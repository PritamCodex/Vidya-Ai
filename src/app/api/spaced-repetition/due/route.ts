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

    const dueCards = await db.spacedRepetition.findMany({
      where: {
        userId: session.user.id,
        nextReviewDate: { lte: new Date() }
      },
      orderBy: { nextReviewDate: "asc" }
    })

    return NextResponse.json(dueCards)
  } catch (error) {
    console.error("Error fetching due cards:", error)
    return NextResponse.json({ error: "Failed to fetch due cards" }, { status: 500 })
  }
}