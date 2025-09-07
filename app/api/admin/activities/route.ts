import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 모든 활동 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 관리자 권한 확인
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }
    
    const activities = await prisma.activity.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                school: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 100 // 최근 100개만 가져오기 (성능 최적화)
    })
    
    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Get activities error:", error)
    return NextResponse.json(
      { error: "활동 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}