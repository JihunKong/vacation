import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get('period') || 'current'
    
    let monthStart: Date
    let monthEnd: Date
    
    if (period === 'current') {
      const now = new Date()
      monthStart = startOfMonth(now)
      monthEnd = endOfMonth(now)
    } else {
      // Format: yyyy-MM
      const [year, month] = period.split('-').map(Number)
      monthStart = new Date(year, month - 1, 1)
      monthEnd = endOfMonth(monthStart)
    }

    // 해당 월 활동 집계
    const studentsWithMonthlyStats = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        activities: {
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }
      }
    })

    // 월간 통계 계산
    const studentsWithStats = studentsWithMonthlyStats.map(student => {
      const monthlyXP = student.activities.reduce((sum, a) => sum + a.xpEarned, 0)
      const monthlyMinutes = student.activities.reduce((sum, a) => sum + a.minutes, 0)
      
      return {
        ...student,
        monthlyXP,
        monthlyMinutes,
        activities: undefined // Remove activities array from response
      }
    }).filter(s => s.monthlyXP > 0) // Only include students with activity this month

    // XP 기준 상위 20명
    const topStudents = studentsWithStats
      .sort((a, b) => b.monthlyXP - a.monthlyXP)
      .slice(0, 20)

    // 활동 시간 기준 상위 10명
    const mostActiveStudents = studentsWithStats
      .sort((a, b) => b.monthlyMinutes - a.monthlyMinutes)
      .slice(0, 10)

    // 연속 출석 기준
    // 과거 월의 경우 해당 시점의 데이터가 없으므로 현재 데이터 사용
    const longestStreaks = period === 'current' 
      ? await prisma.studentProfile.findMany({
          orderBy: { currentStreak: "desc" },
          where: { currentStreak: { gt: 0 } },
          take: 10,
          include: {
            user: {
              select: { name: true },
            },
          },
        })
      : [] // 과거 데이터는 연속 기록 표시 안 함

    return NextResponse.json({
      topStudents,
      mostActiveStudents,
      longestStreaks,
      currentUserId: session.user.id
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}