import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentProfileId, items } = await req.json()

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

    // 기존 계획이 있는지 확인
    const existingPlan = await prisma.plan.findFirst({
      where: {
        studentId: studentProfileId,
        date: today,
      },
    })

    if (existingPlan) {
      return NextResponse.json({ error: "Plan already exists" }, { status: 400 })
    }

    // 계획 생성
    const plan = await prisma.plan.create({
      data: {
        studentId: studentProfileId,
        date: today,
        items: {
          create: items.map((item: any) => ({
            title: item.title,
            category: item.category,
            targetMinutes: item.targetMinutes,
            order: item.order,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId, items } = await req.json()

    // 계획 조회 및 권한 확인
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { student: true },
    })

    if (!plan || plan.student.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 기존 항목 삭제
    await prisma.planItem.deleteMany({
      where: { planId },
    })

    // 새 항목 생성
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        items: {
          create: items.map((item: any) => ({
            title: item.title,
            category: item.category,
            targetMinutes: item.targetMinutes,
            order: item.order,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error("Error updating plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}