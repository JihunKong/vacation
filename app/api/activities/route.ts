import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { calculateLevel } from "@/lib/game/stats"
import { BADGE_CRITERIA, BadgeCheckData } from "@/lib/game/badges"
import { Category } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      studentProfileId,
      title,
      description,
      category,
      minutes,
      planItemId,
      xpEarned,
      statPoints,
    } = await req.json()

    // 입력값 검증
    if (!title || !category || !minutes || minutes <= 0) {
      return NextResponse.json(
        { error: "Invalid input: title, category, and positive minutes are required" },
        { status: 400 }
      )
    }

    // 시간 제약 - 하루 최대 24시간(1440분), 한 번에 최대 8시간(480분)
    if (minutes > 480) {
      return NextResponse.json(
        { error: "Maximum 480 minutes (8 hours) per activity" },
        { status: 400 }
      )
    }

    // 권한 확인
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        badges: true,
        activities: true,
      },
    })

    if (!studentProfile || studentProfile.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 오늘 날짜
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 오늘 총 활동 시간 체크
    const todayActivities = await prisma.activity.aggregate({
      where: {
        studentId: studentProfileId,
        date: today,
      },
      _sum: {
        minutes: true,
      },
    })

    const todayTotalMinutes = todayActivities._sum.minutes || 0
    if (todayTotalMinutes + minutes > 1440) {
      return NextResponse.json(
        { error: `Today's total cannot exceed 1440 minutes (24 hours). Current: ${todayTotalMinutes} minutes` },
        { status: 400 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 활동 기록 생성
      const activity = await tx.activity.create({
        data: {
          studentId: studentProfileId,
          title,
          description: description || null,
          category,
          minutes,
          date: today,
          xpEarned,
          statPoints,
        },
      })

      // 계획 항목 완료 처리
      if (planItemId) {
        await tx.planItem.update({
          where: { id: planItemId },
          data: {
            isCompleted: true,
            actualMinutes: minutes,
          },
        })

        // 계획의 모든 항목이 완료되었는지 확인
        const plan = await tx.plan.findFirst({
          where: { items: { some: { id: planItemId } } },
          include: { items: true },
        })

        if (plan && plan.items.every(item => item.isCompleted)) {
          await tx.plan.update({
            where: { id: plan.id },
            data: {
              isCompleted: true,
              completedAt: new Date(),
            },
          })

          // 연속 달성 업데이트
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)

          const yesterdayPlan = await tx.plan.findFirst({
            where: {
              studentId: studentProfileId,
              date: yesterday,
              isCompleted: true,
            },
          })

          const newStreak = yesterdayPlan 
            ? studentProfile.currentStreak + 1 
            : 1

          await tx.studentProfile.update({
            where: { id: studentProfileId },
            data: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, studentProfile.longestStreak),
            },
          })
        }
      }

      // 능력치 업데이트
      const updatedProfile = await tx.studentProfile.update({
        where: { id: studentProfileId },
        data: {
          totalXP: { increment: xpEarned },
          totalMinutes: { increment: minutes },
          strength: { increment: statPoints.strength || 0 },
          intelligence: { increment: statPoints.intelligence || 0 },
          dexterity: { increment: statPoints.dexterity || 0 },
          charisma: { increment: statPoints.charisma || 0 },
          vitality: { increment: statPoints.vitality || 0 },
          totalDays: { increment: 1 },
        },
      })

      // 레벨업 확인 및 experience 업데이트
      const { level, currentXP, requiredXP } = calculateLevel(updatedProfile.totalXP)
      const needsUpdate = level !== updatedProfile.level || 
                         currentXP !== updatedProfile.experience ||
                         requiredXP !== updatedProfile.xpForNextLevel
      
      if (needsUpdate) {
        await tx.studentProfile.update({
          where: { id: studentProfileId },
          data: {
            level,
            experience: currentXP, // 현재 레벨에서의 진행도
            xpForNextLevel: requiredXP,
          },
        })
      }

      // 배지 획득 확인
      const allActivities = await tx.activity.findMany({
        where: { studentId: studentProfileId },
      })

      // 카테고리별 총 시간 계산
      const totalMinutes: Record<Category, number> = {
        STUDY: 0,
        EXERCISE: 0,
        READING: 0,
        HOBBY: 0,
        VOLUNTEER: 0,
        OTHER: 0,
      }

      allActivities.forEach(act => {
        totalMinutes[act.category] += act.minutes
      })

      const badgeCheckData: BadgeCheckData = {
        totalMinutes,
        level,
        currentStreak: updatedProfile.currentStreak,
        totalDays: updatedProfile.totalDays,
      }

      // 새로 획득할 배지 확인
      const newBadges = []
      for (const criteria of BADGE_CRITERIA) {
        const hasEarned = studentProfile.badges.some(
          b => b.type === criteria.type && b.tier === criteria.tier
        )
        
        if (!hasEarned && criteria.check(badgeCheckData)) {
          newBadges.push({
            studentId: studentProfileId,
            type: criteria.type,
            tier: criteria.tier,
          })
        }
      }

      // 배지 생성
      if (newBadges.length > 0) {
        await tx.badge.createMany({
          data: newBadges,
        })
      }

      return { activity, newBadges: newBadges.length }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error recording activity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}