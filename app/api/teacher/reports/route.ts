import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 교사 권한 및 학교 확인
    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, schoolId: true }
    })

    if (teacher?.role !== "TEACHER" || !teacher?.schoolId) {
      return NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 })
    }

    // 학교의 모든 학생 수
    const totalStudents = await prisma.user.count({
      where: {
        schoolId: teacher.schoolId,
        role: "STUDENT"
      }
    })

    // 활동한 학생 수
    const activeStudents = await prisma.studentProfile.count({
      where: {
        user: {
          schoolId: teacher.schoolId
        },
        activities: {
          some: {}
        }
      }
    })

    // 최근 7일간의 데이터
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // 전체 활동 통계
    const activities = await prisma.activity.findMany({
      where: {
        student: {
          user: {
            schoolId: teacher.schoolId
          }
        },
        date: {
          gte: sevenDaysAgo
        }
      },
      select: {
        category: true,
        minutes: true,
        date: true
      }
    })

    // 카테고리별 통계
    const categoryStats = activities.reduce((acc, activity) => {
      const category = activity.category
      if (!acc[category]) {
        acc[category] = { count: 0, totalMinutes: 0 }
      }
      acc[category].count++
      acc[category].totalMinutes += activity.minutes
      return acc
    }, {} as Record<string, { count: number; totalMinutes: number }>)

    // 일별 트렌드
    const dailyStats = activities.reduce((acc, activity) => {
      const dateKey = activity.date.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = { count: 0, minutes: 0 }
      }
      acc[dateKey].count++
      acc[dateKey].minutes += activity.minutes
      return acc
    }, {} as Record<string, { count: number; minutes: number }>)

    // 7일간의 데이터 배열 생성 (빈 날짜도 포함)
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      weeklyTrend.push({
        date: dateKey,
        count: dailyStats[dateKey]?.count || 0,
        minutes: dailyStats[dateKey]?.minutes || 0
      })
    }

    const totalMinutes = activities.reduce((sum, a) => sum + a.minutes, 0)
    const averageMinutesPerStudent = activeStudents > 0 
      ? Math.round(totalMinutes / activeStudents) 
      : 0

    return NextResponse.json({
      totalStudents,
      activeStudents,
      totalActivities: activities.length,
      totalMinutes,
      averageMinutesPerStudent,
      categoryStats: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        ...stats
      })),
      weeklyTrend
    })
  } catch (error) {
    console.error("Reports API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}