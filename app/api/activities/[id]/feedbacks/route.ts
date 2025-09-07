import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: activityId } = await params

    // 활동과 피드백 정보 가져오기
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        feedbacks: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                schoolId: true
              }
            }
          }
        }
      }
    })

    if (!activity) {
      return NextResponse.json({ error: "활동을 찾을 수 없습니다." }, { status: 404 })
    }

    // 권한 확인: 학생 본인 또는 같은 학교의 교사만 조회 가능
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, schoolId: true, studentProfile: true }
    })

    const isStudent = user?.studentProfile?.id === activity.studentId
    const isTeacherFromSameSchool = 
      user?.role === "TEACHER" && 
      user?.schoolId === activity.student.user.schoolId

    if (!isStudent && !isTeacherFromSameSchool) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    return NextResponse.json({
      feedbacks: activity.feedbacks
    })
  } catch (error) {
    console.error("Feedbacks API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}