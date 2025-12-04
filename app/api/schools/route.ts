import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const schools = await prisma.school.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      schools: schools
    })
  } catch (error) {
    console.error('Failed to fetch schools:', error)
    return NextResponse.json(
      { error: "학교 목록을 가져오는데 실패했습니다." },
      { status: 500 }
    )
  }
}