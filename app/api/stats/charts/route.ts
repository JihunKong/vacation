import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { subDays, subWeeks, subMonths, startOfDay, endOfDay, format, startOfWeek, endOfWeek } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        studentProfile: {
          include: {
            activities: {
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    })

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const activities = user.studentProfile.activities
    const now = new Date()

    // 일간 데이터 (최근 30일)
    const dailyData = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      
      const dayActivities = activities.filter(a => {
        const activityDate = new Date(a.date)
        return activityDate >= dayStart && activityDate <= dayEnd
      })

      dailyData.push({
        date: format(date, 'MM/dd'),
        xp: dayActivities.reduce((sum, a) => sum + a.xpEarned, 0),
        minutes: dayActivities.reduce((sum, a) => sum + a.minutes, 0),
        activities: dayActivities.length
      })
    }

    // 주간 데이터 (최근 12주)
    const weeklyData = []
    for (let i = 11; i >= 0; i--) {
      const weekDate = subWeeks(now, i)
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 })
      
      const weekActivities = activities.filter(a => {
        const activityDate = new Date(a.date)
        return activityDate >= weekStart && activityDate <= weekEnd
      })

      weeklyData.push({
        week: `W${format(weekStart, 'ww')}`,
        xp: weekActivities.reduce((sum, a) => sum + a.xpEarned, 0),
        minutes: weekActivities.reduce((sum, a) => sum + a.minutes, 0),
        activities: weekActivities.length
      })
    }

    // 월간 데이터 (최근 12개월)
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const monthActivities = activities.filter(a => {
        const activityDate = new Date(a.date)
        return activityDate >= monthStart && activityDate <= monthEnd
      })

      monthlyData.push({
        month: format(monthDate, 'MM월'),
        xp: monthActivities.reduce((sum, a) => sum + a.xpEarned, 0),
        minutes: monthActivities.reduce((sum, a) => sum + a.minutes, 0),
        activities: monthActivities.length
      })
    }

    // 카테고리별 분포
    const categoryBreakdown = Object.entries(
      activities.reduce((acc, activity) => {
        acc[activity.category] = (acc[activity.category] || 0) + activity.minutes
        return acc
      }, {} as Record<string, number>)
    ).map(([category, value]) => ({
      category,
      value,
      color: getCategoryColor(category)
    }))

    // 시간대별 히트맵 데이터 (KST 기준)
    const hourlyHeatmap = []
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const count = activities.filter(a => {
          // createdAt을 사용하며, 서버가 UTC로 저장하므로 KST로 변환
          const date = new Date(a.createdAt)
          // 서버 시간이 UTC인 경우 KST로 변환 (UTC + 9시간)
          const kstHours = date.getUTCHours() + 9
          const kstDay = date.getUTCDay()
          
          // 시간이 24를 넘으면 다음 날로
          let adjustedHour = kstHours
          let adjustedDay = kstDay
          
          if (kstHours >= 24) {
            adjustedHour = kstHours - 24
            adjustedDay = (kstDay + 1) % 7
          }
          
          return adjustedDay === day && adjustedHour === hour
        }).length
        
        hourlyHeatmap.push({
          day,
          hour,
          value: count
        })
      }
    }

    // 능력치 레이더 차트 데이터
    const profile = user.studentProfile
    const maxStat = 100 // 최대 스탯 값
    const statRadar = [
      { stat: 'STR', value: profile.strength, fullMark: maxStat },
      { stat: 'INT', value: profile.intelligence, fullMark: maxStat },
      { stat: 'DEX', value: profile.dexterity, fullMark: maxStat },
      { stat: 'CHA', value: profile.charisma, fullMark: maxStat },
      { stat: 'VIT', value: profile.vitality, fullMark: maxStat }
    ]

    return NextResponse.json({
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
      categoryBreakdown,
      hourlyHeatmap,
      statRadar
    })
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    STUDY: '#8B5CF6',
    EXERCISE: '#EF4444',
    READING: '#3B82F6',
    HOBBY: '#10B981',
    VOLUNTEER: '#F59E0B',
    OTHER: '#6B7280'
  }
  return colors[category] || '#6B7280'
}