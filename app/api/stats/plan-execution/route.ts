import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { studentProfile: true }
    })

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // 월요일 시작
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // 일간 통계
    const todayPlan = await prisma.plan.findFirst({
      where: {
        studentId: user.studentProfile.id,
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      include: {
        items: true
      }
    })

    const dailyStats = {
      totalItems: todayPlan?.items.length || 0,
      completedItems: todayPlan?.items.filter(item => item.isCompleted).length || 0,
      percentage: 0,
      streak: 0
    }

    if (dailyStats.totalItems > 0) {
      dailyStats.percentage = Math.round((dailyStats.completedItems / dailyStats.totalItems) * 100)
    }

    // 연속 달성일 계산
    let currentDate = new Date(todayStart)
    let streak = 0
    
    while (true) {
      const plan = await prisma.plan.findFirst({
        where: {
          studentId: user.studentProfile.id,
          date: {
            gte: startOfDay(currentDate),
            lte: endOfDay(currentDate)
          }
        },
        include: {
          items: true
        }
      })

      if (plan && plan.items.length > 0) {
        const completionRate = plan.items.filter(item => item.isCompleted).length / plan.items.length
        if (completionRate >= 0.7) { // 70% 이상 완료시 연속 인정
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      } else {
        break
      }
    }
    
    dailyStats.streak = streak

    // 주간 통계
    const weekPlans = await prisma.plan.findMany({
      where: {
        studentId: user.studentProfile.id,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        items: true
      }
    })

    const weeklyStats = {
      totalItems: 0,
      completedItems: 0,
      percentage: 0,
      bestDay: ''
    }

    let bestDayRate = 0
    let bestDayName = ''

    weekPlans.forEach(plan => {
      weeklyStats.totalItems += plan.items.length
      weeklyStats.completedItems += plan.items.filter(item => item.isCompleted).length
      
      if (plan.items.length > 0) {
        const dayRate = plan.items.filter(item => item.isCompleted).length / plan.items.length
        if (dayRate > bestDayRate) {
          bestDayRate = dayRate
          bestDayName = new Date(plan.date).toLocaleDateString('ko-KR', { weekday: 'long' })
        }
      }
    })

    if (weeklyStats.totalItems > 0) {
      weeklyStats.percentage = Math.round((weeklyStats.completedItems / weeklyStats.totalItems) * 100)
    }
    weeklyStats.bestDay = bestDayName

    // 월간 통계
    const monthPlans = await prisma.plan.findMany({
      where: {
        studentId: user.studentProfile.id,
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      include: {
        items: true
      }
    })

    const monthlyStats = {
      totalItems: 0,
      completedItems: 0,
      percentage: 0,
      totalXP: 0
    }

    monthPlans.forEach(plan => {
      monthlyStats.totalItems += plan.items.length
      monthlyStats.completedItems += plan.items.filter(item => item.isCompleted).length
    })

    if (monthlyStats.totalItems > 0) {
      monthlyStats.percentage = Math.round((monthlyStats.completedItems / monthlyStats.totalItems) * 100)
    }

    // 월간 XP 계산
    const monthActivities = await prisma.activity.findMany({
      where: {
        studentId: user.studentProfile.id,
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    monthlyStats.totalXP = monthActivities.reduce((sum, activity) => sum + activity.xpEarned, 0)

    return NextResponse.json({
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats
    })
  } catch (error) {
    console.error('Plan execution stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}