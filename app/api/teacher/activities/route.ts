import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 교사 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, schoolId: true }
    })

    if (user?.role !== "TEACHER") {
      return NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 })
    }

    if (!user?.schoolId) {
      return NextResponse.json({ error: "학교가 설정되지 않았습니다." }, { status: 400 })
    }

    // 교사의 학교에 속한 학생들의 활동만 조회
    const activities = await prisma.activity.findMany({
      where: {
        student: {
          user: {
            schoolId: user.schoolId
          }
        }
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        feedbacks: {
          where: {
            teacherId: session.user.id
          },
          select: {
            id: true,
            type: true,
            message: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 100 // 최근 100개 활동
    })

    // 응답 데이터 형식 정리
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      category: activity.category,
      minutes: activity.minutes,
      date: activity.date,
      xpEarned: activity.xpEarned,
      student: {
        id: activity.studentId,
        user: {
          id: activity.student.user.id,
          name: activity.student.user.name,
          email: activity.student.user.email
        }
      },
      feedbacks: activity.feedbacks,
      hasTeacherFeedback: activity.feedbacks.length > 0
    }))

    return NextResponse.json({
      activities: formattedActivities,
      count: formattedActivities.length
    })

  } catch (error) {
    console.error("Error fetching teacher activities:", error)
    return NextResponse.json(
      { error: "활동을 불러오는 데 실패했습니다." },
      { status: 500 }
    )
  }
}