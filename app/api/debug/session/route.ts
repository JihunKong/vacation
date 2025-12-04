import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      hasSession: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Session debug error:", error)
    return NextResponse.json(
      { error: "세션 확인 중 오류가 발생했습니다.", details: error },
      { status: 500 }
    )
  }
}