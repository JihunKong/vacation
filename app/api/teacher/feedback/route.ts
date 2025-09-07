import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface FeedbackRequest {
  activityId: string
  studentId: string
  message: string
  type: "FEEDBACK" | "ENCOURAGEMENT"
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const body: FeedbackRequest = await request.json()
    const { activityId, studentId, message, type } = body

    // 입력값 검증
    if (!activityId || !studentId || !message?.trim() || !type) {
      return NextResponse.json({ error: "필수 필드가 누락되었습니다." }, { status: 400 })
    }

    if (!["FEEDBACK", "ENCOURAGEMENT"].includes(type)) {
      return NextResponse.json({ error: "잘못된 피드백 유형입니다." }, { status: 400 })
    }

    // 교사 권한 확인
    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, schoolId: true }
    })

    if (teacher?.role !== "TEACHER") {
      return NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 })
    }

    if (!teacher?.schoolId) {
      return NextResponse.json({ error: "학교가 설정되지 않았습니다." }, { status: 400 })
    }

    // 활동이 존재하고 해당 학생의 것인지 확인
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        studentId: studentId  // studentId는 이미 StudentProfile의 ID
      },
      include: {
        feedbacks: {
          where: { teacherId: session.user.id }
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                schoolId: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!activity) {
      return NextResponse.json({ error: "활동을 찾을 수 없습니다." }, { status: 404 })
    }

    // 학생이 같은 학교에 속하는지 확인
    if (activity.student.user.schoolId !== teacher.schoolId) {
      return NextResponse.json({ error: "같은 학교 학생에게만 피드백을 제공할 수 있습니다." }, { status: 403 })
    }

    // 이미 피드백을 제공했는지 확인
    if (activity.feedbacks.length > 0) {
      return NextResponse.json({ error: "이미 이 활동에 피드백을 제공했습니다." }, { status: 400 })
    }

    // 트랜잭션으로 피드백과 알림 생성
    const result = await prisma.$transaction(async (tx) => {
      // 피드백 생성
      const feedback = await tx.feedback.create({
        data: {
          teacherId: session.user.id,
          studentId: activity.student.user.id,  // User ID로 변경
          activityId: activityId,
          message: message.trim(),
          type: type
        }
      })

      // 학생에게 알림 생성
      const notification = await tx.notification.create({
        data: {
          userId: activity.student.user.id,  // User ID로 변경
          type: type,
          title: type === "FEEDBACK" ? "교사 피드백" : "교사 응원",
          message: type === "FEEDBACK" 
            ? `"${activity.title}" 활동에 대한 교사의 피드백이 도착했습니다.`
            : `"${activity.title}" 활동에 대한 교사의 응원 메시지가 도착했습니다.`,
          relatedId: feedback.id,
          relatedType: "feedback"
        }
      })

      return { feedback, notification }
    })

    return NextResponse.json({
      message: type === "FEEDBACK" ? "피드백이 성공적으로 전송되었습니다." : "응원 메시지가 성공적으로 전송되었습니다.",
      feedback: {
        id: result.feedback.id,
        type: result.feedback.type,
        message: result.feedback.message,
        createdAt: result.feedback.createdAt
      }
    })

  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json(
      { error: "피드백 전송에 실패했습니다." },
      { status: 500 }
    )
  }
}