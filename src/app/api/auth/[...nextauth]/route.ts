import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Auth endpoint - disabled for demo" })
}

export async function POST() {
  return NextResponse.json({ message: "Auth endpoint - disabled for demo" })
}