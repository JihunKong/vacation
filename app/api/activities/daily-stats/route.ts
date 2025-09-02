import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Category } from "@prisma/client"
import { CATEGORY_DAILY_LIMIT } from "@/lib/game/stats"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const studentProfileId = searchParams.get("studentProfileId")
    
    if (!studentProfileId) {
      return NextResponse.json(
        { error: "Student profile ID is required" },
        { status: 400 }
      )
    }

    // 권한 확인
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
    })

    if (!studentProfile || studentProfile.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 오늘 날짜
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 오늘의 활동들 조회
    const todayActivities = await prisma.activity.findMany({
      where: {
        studentId: studentProfileId,
        date: today,
      },
    })

    // 카테고리별 총 시간 계산
    const categoryStats: Record<Category, { 
      totalMinutes: number
      limit: number
      isLimitReached: boolean
      remainingMinutes: number
      xpRate: "normal" | "reduced"
    }> = {
      [Category.STUDY]: { totalMinutes: 0, limit: 0, isLimitReached: false, remainingMinutes: 0, xpRate: "normal" },
      [Category.EXERCISE]: { totalMinutes: 0, limit: 0, isLimitReached: false, remainingMinutes: 0, xpRate: "normal" },
      [Category.READING]: { totalMinutes: 0, limit: 0, isLimitReached: false, remainingMinutes: 0, xpRate: "normal" },
      [Category.HOBBY]: { totalMinutes: 0, limit: 0, isLimitReached: false, remainingMinutes: 0, xpRate: "normal" },
      [Category.VOLUNTEER]: { totalMinutes: 0, limit: 0, isLimitReached: false, remainingMinutes: 0, xpRate: "normal" },
      [Category.OTHER]: { totalMinutes: 0, limit: 0, isLimitReached: false, remainingMinutes: 0, xpRate: "normal" },
    }

    // 각 카테고리별 통계 계산
    for (const category of Object.values(Category)) {
      const categoryMinutes = todayActivities
        .filter(act => act.category === category)
        .reduce((sum, act) => sum + act.minutes, 0)
      
      const limit = CATEGORY_DAILY_LIMIT[category]
      const isLimitReached = categoryMinutes >= limit
      const remainingMinutes = Math.max(0, limit - categoryMinutes)
      const xpRate = isLimitReached ? "reduced" : "normal"
      
      categoryStats[category] = {
        totalMinutes: categoryMinutes,
        limit,
        isLimitReached,
        remainingMinutes,
        xpRate,
      }
    }

    // 전체 통계
    const totalMinutesToday = todayActivities.reduce((sum, act) => sum + act.minutes, 0)
    const totalXPToday = todayActivities.reduce((sum, act) => sum + act.xpEarned, 0)

    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      totalMinutesToday,
      totalXPToday,
      categoryStats,
      currentStreak: studentProfile.currentStreak,
    })
  } catch (error) {
    console.error("Error fetching daily stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}