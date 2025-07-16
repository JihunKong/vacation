# 05. API 엔드포인트 구현

## 1. API 응답 유틸리티

`lib/api/response.ts` 파일 생성:

```typescript
import { NextResponse } from "next/server"

export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json(
      { success: true, data },
      { status }
    )
  }

  static error(message: string, status = 400) {
    return NextResponse.json(
      { success: false, error: message },
      { status }
    )
  }

  static unauthorized(message = "인증이 필요합니다") {
    return this.error(message, 401)
  }

  static forbidden(message = "권한이 없습니다") {
    return this.error(message, 403)
  }

  static notFound(message = "찾을 수 없습니다") {
    return this.error(message, 404)
  }

  static serverError(error: unknown) {
    console.error("Server error:", error)
    return this.error("서버 오류가 발생했습니다", 500)
  }
}
```

## 2. 계획(Plan) API

`app/api/plans/route.ts` 파일 생성:

```typescript
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"
import { ApiResponse } from "@/lib/api/response"
import { Category } from "@prisma/client"
import { z } from "zod"
import { startOfDay, endOfDay } from "date-fns"

// 계획 생성 스키마
const createPlanSchema = z.object({
  date: z.string().datetime(),
  category: z.nativeEnum(Category),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  targetTime: z.number().min(5).max(480), // 5분 ~ 8시간
})

// 계획 목록 조회 (GET)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return ApiResponse.unauthorized()
    }

    const searchParams = req.nextUrl.searchParams
    const date = searchParams.get("date")
    const category = searchParams.get("category") as Category | null

    // 쿼리 조건 설정
    const where: any = { userId: session.user.id }
    
    if (date) {
      const targetDate = new Date(date)
      where.date = {
        gte: startOfDay(targetDate),
        lte: endOfDay(targetDate)
      }
    }
    
    if (category) {
      where.category = category
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: { date: "asc" }
    })

    return ApiResponse.success(plans)
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}

// 계획 생성 (POST)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return ApiResponse.unauthorized()
    }

    const body = await req.json()
    const validation = createPlanSchema.safeParse(body)
    
    if (!validation.success) {
      return ApiResponse.error(validation.error.errors[0].message)
    }

    const { date, category, title, description, targetTime } = validation.data

    // 경험치 계산
    const expSettings = await prisma.systemConfig.findUnique({
      where: { key: "exp_settings" }
    })
    
    const baseExp = (expSettings?.value as any)?.daily_plan || 10

    const plan = await prisma.plan.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        category,
        title,
        description,
        targetTime,
        exp: baseExp
      }
    })

    return ApiResponse.success(plan, 201)
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}
```

`app/api/plans/[id]/route.ts` 파일 생성:

```typescript
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"
import { ApiResponse } from "@/lib/api/response"
import { updateUserStats, calculateLevel } from "@/lib/db/queries"
import { z } from "zod"

// 계획 수정 스키마
const updatePlanSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  targetTime: z.number().min(5).max(480).optional(),
  actualTime: z.number().min(0).max(480).optional(),
  completed: z.boolean().optional()
})

// 계획 조회 (GET)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return ApiResponse.unauthorized()
    }

    const plan = await prisma.plan.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!plan) {
      return ApiResponse.notFound("계획을 찾을 수 없습니다")
    }

    return ApiResponse.success(plan)
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}

// 계획 수정 (PUT)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return ApiResponse.unauthorized()
    }

    const body = await req.json()
    const validation = updatePlanSchema.safeParse(body)
    
    if (!validation.success) {
      return ApiResponse.error(validation.error.errors[0].message)
    }

    const plan = await prisma.plan.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!plan) {
      return ApiResponse.notFound("계획을 찾을 수 없습니다")
    }

    const { completed, actualTime, ...updateData } = validation.data

    // 완료 처리
    if (completed !== undefined && completed && !plan.completed) {
      const expSettings = await prisma.systemConfig.findUnique({
        where: { key: "exp_settings" }
      })
      
      const settings = expSettings?.value as any
      const categoryMultiplier = settings?.category_multipliers?.[plan.category] || 1.0
      const completionBonus = settings?.completion_80 || 20
      
      // 달성률 계산
      const achievementRate = actualTime ? (actualTime / plan.targetTime) * 100 : 0
      const bonusExp = achievementRate >= 80 ? completionBonus : 0
      
      // 총 경험치 계산
      const totalExp = Math.floor((plan.exp + bonusExp) * categoryMultiplier)

      // 트랜잭션으로 처리
      await prisma.$transaction(async (tx) => {
        // 계획 업데이트
        await tx.plan.update({
          where: { id: params.id },
          data: {
            ...updateData,
            completed: true,
            completedAt: new Date(),
            actualTime: actualTime || plan.targetTime,
            exp: totalExp
          }
        })

        // 사용자 경험치 업데이트
        const user = await tx.user.update({
          where: { id: session.user.id },
          data: {
            totalExp: {
              increment: totalExp
            }
          }
        })

        // 레벨 체크 및 업데이트
        const newLevel = calculateLevel(user.totalExp)
        if (newLevel > user.level) {
          await tx.user.update({
            where: { id: session.user.id },
            data: { level: newLevel }
          })
        }

        // 카테고리별 시간 업데이트
        if (actualTime) {
          await updateUserStats(session.user.id, plan.category, actualTime)
        }

        // 연속 달성 체크
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        
        const yesterdayPlan = await tx.plan.findFirst({
          where: {
            userId: session.user.id,
            completed: true,
            completedAt: {
              gte: new Date(yesterday.setHours(0, 0, 0, 0)),
              lt: new Date(yesterday.setHours(23, 59, 59, 999))
            }
          }
        })

        if (yesterdayPlan) {
          await tx.userStats.update({
            where: { userId: session.user.id },
            data: {
              currentStreak: { increment: 1 },
              lastActiveDate: new Date()
            }
          })
        } else {
          await tx.userStats.update({
            where: { userId: session.user.id },
            data: {
              currentStreak: 1,
              lastActiveDate: new Date()
            }
          })
        }
      })
    } else {
      // 단순 업데이트
      await prisma.plan.update({
        where: { id: params.id },
        data: {
          ...updateData,
          ...(actualTime !== undefined && { actualTime }),
          ...(completed !== undefined && { completed })
        }
      })
    }

    const updatedPlan = await prisma.plan.findUnique({
      where: { id: params.id }
    })

    return ApiResponse.success(updatedPlan)
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}

// 계획 삭제 (DELETE)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return ApiResponse.unauthorized()
    }

    const plan = await prisma.plan.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!plan) {
      return ApiResponse.notFound("계획을 찾을 수 없습니다")
    }

    if (plan.completed) {
      return ApiResponse.error("완료된 계획은 삭제할 수 없습니다")
    }

    await prisma.plan.delete({
      where: { id: params.id }
    })

    return ApiResponse.success({ deleted: true })
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}
```

## 3. 통계(Stats) API

`app/api/stats/route.ts` 파일 생성:

```typescript
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"
import { ApiResponse } from "@/lib/api/response"
import { startOfWeek, endOfWeek, subWeeks } from "date-fns"

// 사용자 통계 조회 (GET)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return ApiResponse.unauthorized()
    }

    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get("period") || "week" // week, month, all

    // 기본 통계
    const stats = await prisma.userStats.findUnique({
      where: { userId: session.user.id }
    })

    if (!stats) {
      return ApiResponse.success({
        studyTime: 0,
        exerciseTime: 0,
        readingTime: 0,
        volunteerTime: 0,
        hobbyTime: 0,
        socialTime: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalDays: 0
      })
    }

    // 기간별 통계
    let periodStats = null
    
    if (period === "week") {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
      
      periodStats = await prisma.plan.groupBy({
        by: ["category"],
        where: {
          userId: session.user.id,
          completed: true,
          completedAt: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        _sum: {
          actualTime: true,
          exp: true
        }
      })
    }

    // 최근 활동
    const recentActivities = await prisma.plan.findMany({
      where: {
        userId: session.user.id,
        completed: true
      },
      orderBy: { completedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        category: true,
        completedAt: true,
        exp: true,
        actualTime: true
      }
    })

    return ApiResponse.success({
      overall: stats,
      period: periodStats,
      recent: recentActivities
    })
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}
```

`app/api/stats/leaderboard/route.ts` 파일 생성:

```typescript
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"
import { ApiResponse } from "@/lib/api/response"

// 리더보드 조회 (GET)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return ApiResponse.unauthorized()
    }

    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get("type") || "level" // level, streak, weekly
    const classId = searchParams.get("classId")

    let leaderboard = []

    switch (type) {
      case "level":
        leaderboard = await prisma.user.findMany({
          where: {
            role: "STUDENT",
            ...(classId && { classId })
          },
          orderBy: [
            { totalExp: "desc" },
            { level: "desc" }
          ],
          take: 50,
          select: {
            id: true,
            nickname: true,
            level: true,
            totalExp: true,
            image: true,
            classId: true
          }
        })
        break

      case "streak":
        const streakData = await prisma.userStats.findMany({
          where: {
            user: {
              role: "STUDENT",
              ...(classId && { classId })
            }
          },
          orderBy: { currentStreak: "desc" },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                image: true,
                level: true,
                classId: true
              }
            }
          }
        })
        
        leaderboard = streakData.map(stat => ({
          ...stat.user,
          currentStreak: stat.currentStreak
        }))
        break

      case "weekly":
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        
        const weeklyData = await prisma.plan.groupBy({
          by: ["userId"],
          where: {
            completed: true,
            completedAt: { gte: weekStart },
            user: {
              role: "STUDENT",
              ...(classId && { classId })
            }
          },
          _sum: { exp: true },
          orderBy: { _sum: { exp: "desc" } },
          take: 50
        })

        // 사용자 정보 조회
        const userIds = weeklyData.map(d => d.userId)
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            nickname: true,
            image: true,
            level: true,
            classId: true
          }
        })

        const userMap = new Map(users.map(u => [u.id, u]))
        
        leaderboard = weeklyData.map(data => ({
          ...userMap.get(data.userId),
          weeklyExp: data._sum.exp || 0
        }))
        break
    }

    // 현재 사용자 순위
    const currentUserRank = leaderboard.findIndex(u => u.id === session.user.id) + 1

    return ApiResponse.success({
      leaderboard,
      currentUserRank: currentUserRank || null
    })
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}
```

## 4. 업적(Achievement) API

`app/api/achievements/route.ts` 파일 생성:

```typescript
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"
import { ApiResponse } from "@/lib/api/response"
import { AchievementType } from "@prisma/client"

// 업적 체크 및 부여
export async function checkAndGrantAchievements(userId: string) {
  const achievements = []

  // 첫 계획 수립
  const firstPlan = await prisma.plan.findFirst({
    where: { userId }
  })
  
  if (firstPlan) {
    achievements.push({
      userId,
      type: AchievementType.FIRST_PLAN,
      name: "첫 걸음",
      description: "첫 계획을 수립했습니다",
      icon: "🎯",
      exp: 50
    })
  }

  // 첫 계획 완료
  const firstComplete = await prisma.plan.findFirst({
    where: { userId, completed: true }
  })
  
  if (firstComplete) {
    achievements.push({
      userId,
      type: AchievementType.FIRST_COMPLETE,
      name: "목표 달성",
      description: "첫 계획을 완료했습니다",
      icon: "✅",
      exp: 100
    })
  }

  // 연속 달성 체크
  const stats = await prisma.userStats.findUnique({
    where: { userId }
  })

  if (stats) {
    if (stats.currentStreak >= 3) {
      achievements.push({
        userId,
        type: AchievementType.STREAK_3,
        name: "3일 연속",
        description: "3일 연속 계획을 달성했습니다",
        icon: "🔥",
        exp: 150
      })
    }
    
    if (stats.currentStreak >= 7) {
      achievements.push({
        userId,
        type: AchievementType.STREAK_7,
        name: "일주일의 약속",
        description: "7일 연속 계획을 달성했습니다",
        icon: "💪",
        exp: 300
      })
    }
  }

  // 레벨 체크
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (user) {
    if (user.level >= 5) {
      achievements.push({
        userId,
        type: AchievementType.LEVEL_5,
        name: "초보 탈출",
        description: "레벨 5를 달성했습니다",
        icon: "⭐",
        exp: 200
      })
    }
  }

  // 기존 업적 확인 및 새 업적 부여
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: {
        userId_type: {
          userId: achievement.userId,
          type: achievement.type
        }
      },
      update: {},
      create: achievement
    })
  }
}

// 업적 목록 조회 (GET)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return ApiResponse.unauthorized()
    }

    const achievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      orderBy: { unlockedAt: "desc" }
    })

    // 전체 업적 목록
    const allAchievements = [
      {
        type: AchievementType.FIRST_PLAN,
        name: "첫 걸음",
        description: "첫 계획을 수립했습니다",
        icon: "🎯"
      },
      {
        type: AchievementType.FIRST_COMPLETE,
        name: "목표 달성",
        description: "첫 계획을 완료했습니다",
        icon: "✅"
      },
      {
        type: AchievementType.STREAK_3,
        name: "3일 연속",
        description: "3일 연속 계획을 달성했습니다",
        icon: "🔥"
      },
      {
        type: AchievementType.STREAK_7,
        name: "일주일의 약속",
        description: "7일 연속 계획을 달성했습니다",
        icon: "💪"
      },
      {
        type: AchievementType.LEVEL_5,
        name: "초보 탈출",
        description: "레벨 5를 달성했습니다",
        icon: "⭐"
      },
      // ... 더 많은 업적
    ]

    const unlockedTypes = new Set(achievements.map(a => a.type))
    
    const achievementStatus = allAchievements.map(a => ({
      ...a,
      unlocked: unlockedTypes.has(a.type),
      unlockedAt: achievements.find(ach => ach.type === a.type)?.unlockedAt
    }))

    return ApiResponse.success({
      unlocked: achievements,
      all: achievementStatus
    })
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}
```

## 다음 단계
API 엔드포인트 구현이 완료되었습니다. 다음은 `06-student-features.md`를 참고하여 학생 기능을 구현하세요.