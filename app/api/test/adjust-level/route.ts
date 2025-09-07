import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 개발 환경에서만 사용 가능한 테스트 API
export async function POST(req: NextRequest) {
  try {
    // 프로덕션 환경에서는 사용 불가
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetLevel } = await req.json()

    if (!targetLevel || targetLevel < 1 || targetLevel > 100) {
      return NextResponse.json(
        { error: "Invalid target level. Must be between 1 and 100" },
        { status: 400 }
      )
    }

    // 학생 프로필 조회
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    // 목표 레벨에 필요한 총 XP 계산
    // 레벨 공식: level = floor(sqrt(totalXP / 100))
    // 역계산: totalXP = level^2 * 100
    let targetXP: number
    
    if (targetLevel === 1) {
      targetXP = 0
    } else {
      // 목표 레벨에서 약간 모자란 XP로 설정 (레벨업 직전 상태)
      const baseXP = (targetLevel - 1) * (targetLevel - 1) * 100
      const nextLevelXP = targetLevel * targetLevel * 100
      targetXP = nextLevelXP - 50 // 다음 레벨까지 50 XP 남김
    }

    // 프로필 업데이트
    const updatedProfile = await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        totalXP: targetXP,
        level: targetLevel - 1, // 한 단계 낮은 레벨로 설정
        experience: targetXP % 10000, // 현재 레벨에서의 경험치
        xpForNextLevel: (targetLevel * targetLevel * 100) - targetXP
      }
    })

    return NextResponse.json({
      success: true,
      message: `Level adjusted to ${targetLevel - 1}. Need 50 more XP to reach level ${targetLevel}`,
      profile: {
        level: updatedProfile.level,
        totalXP: updatedProfile.totalXP,
        experience: updatedProfile.experience,
        xpForNextLevel: updatedProfile.xpForNextLevel
      },
      testTip: "Record a small activity (5-10 minutes) to trigger level up to " + targetLevel
    })
  } catch (error) {
    console.error("Test adjust level error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET 메서드: 현재 레벨 정보 조회
export async function GET(req: NextRequest) {
  try {
    // 프로덕션 환경에서는 사용 불가
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        level: true,
        totalXP: true,
        experience: true,
        xpForNextLevel: true
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    // 다음 10레벨 단위 계산
    const nextMilestone = Math.ceil((studentProfile.level + 1) / 10) * 10
    const xpForMilestone = nextMilestone * nextMilestone * 100

    return NextResponse.json({
      currentLevel: studentProfile.level,
      totalXP: studentProfile.totalXP,
      experience: studentProfile.experience,
      xpForNextLevel: studentProfile.xpForNextLevel,
      nextMilestone: nextMilestone,
      xpNeededForMilestone: xpForMilestone - studentProfile.totalXP,
      testEndpoints: {
        adjustToLevel9: "/api/test/adjust-level (POST) with { targetLevel: 10 }",
        adjustToLevel19: "/api/test/adjust-level (POST) with { targetLevel: 20 }",
        adjustToLevel29: "/api/test/adjust-level (POST) with { targetLevel: 30 }"
      }
    })
  } catch (error) {
    console.error("Test level info error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}