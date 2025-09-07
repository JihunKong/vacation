import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 교사 권한 및 학교 확인
    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, schoolId: true, school: true }
    })

    if (teacher?.role !== "TEACHER" || !teacher?.schoolId) {
      return NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "csv"
    const period = searchParams.get("period") || "week"

    // 기간 설정
    let dateFilter = {}
    const now = new Date()
    
    switch (period) {
      case "today":
        const today = new Date(now.setHours(0, 0, 0, 0))
        dateFilter = { gte: today }
        break
      case "week":
        const weekAgo = new Date(now.setDate(now.getDate() - 7))
        dateFilter = { gte: weekAgo }
        break
      case "month":
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
        dateFilter = { gte: monthAgo }
        break
      default:
        // all - no filter
        break
    }

    // 활동 데이터 가져오기
    const activities = await prisma.activity.findMany({
      where: {
        student: {
          user: {
            schoolId: teacher.schoolId
          }
        },
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
      },
      include: {
        student: {
          include: {
            user: {
              select: {
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
            type: true,
            message: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    if (format === "csv") {
      // CSV 형식으로 변환
      const headers = ["날짜", "학생명", "이메일", "활동명", "카테고리", "시간(분)", "XP", "설명", "피드백여부", "피드백유형", "피드백내용"]
      const rows = activities.map(activity => [
        activity.date.toISOString().split('T')[0],
        activity.student.user.name || "",
        activity.student.user.email,
        activity.title,
        activity.category,
        activity.minutes.toString(),
        activity.xpEarned.toString(),
        activity.description || "",
        activity.feedbacks.length > 0 ? "Y" : "N",
        activity.feedbacks[0]?.type || "",
        activity.feedbacks[0]?.message || ""
      ])

      // BOM 추가 (Excel에서 한글 깨짐 방지)
      const BOM = "\uFEFF"
      const csvContent = BOM + [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="student_activities_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Excel 형식 (JSON으로 반환하고 클라이언트에서 변환)
      const excelData = activities.map(activity => ({
        날짜: activity.date.toISOString().split('T')[0],
        학생명: activity.student.user.name || "",
        이메일: activity.student.user.email,
        활동명: activity.title,
        카테고리: activity.category,
        "시간(분)": activity.minutes,
        XP: activity.xpEarned,
        설명: activity.description || "",
        피드백여부: activity.feedbacks.length > 0 ? "Y" : "N",
        피드백유형: activity.feedbacks[0]?.type || "",
        피드백내용: activity.feedbacks[0]?.message || ""
      }))

      return NextResponse.json(excelData)
    }
  } catch (error) {
    console.error("Export API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}