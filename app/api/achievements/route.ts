import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserAchievements, getCurrentMonthAchievements, initializeAchievements, updateUserAchievementProgress } from '@/lib/achievement-rotation'

// 도전과제 진행 상황 체크 및 업데이트
async function checkAndUpdateAchievements(studentId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      activities: true,
      pomodoroSessions: {
        where: { isCompleted: true }
      },
      plans: {
        include: { items: true }
      }
    }
  })

  if (!profile) return

  // 통계 데이터 수집
  const stats: any = {
    totalActivities: profile.activities.length,
    level: profile.level,
    totalMinutes: profile.totalMinutes,
    pomodoroSessions: profile.pomodoroSessions.length
  }

  // 카테고리별 활동 수
  const categories = ['STUDY', 'EXERCISE', 'READING', 'HOBBY', 'VOLUNTEER', 'OTHER']
  categories.forEach(cat => {
    stats[`${cat.toLowerCase()}Count`] = profile.activities.filter(a => a.category === cat).length
    stats[`${cat.toLowerCase()}Minutes`] = profile.activities
      .filter(a => a.category === cat)
      .reduce((sum, a) => sum + a.minutes, 0)
  })

  // 연속 일수 계산
  const activityDates = [...new Set(profile.activities.map(a => 
    new Date(a.date).toDateString()
  ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let consecutive = 0
  let lastDate: Date | null = null
  
  for (const dateStr of activityDates) {
    const date = new Date(dateStr)
    if (!lastDate) {
      consecutive = 1
      lastDate = date
    } else {
      const dayDiff = (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      if (dayDiff === 1) {
        consecutive++
        lastDate = date
      } else {
        break
      }
    }
  }
  stats.consecutiveDays = consecutive

  // 완벽한 날 계산
  stats.perfectDays = profile.plans.filter(plan => 
    plan.items.length > 0 && 
    plan.items.every(item => item.isCompleted)
  ).length

  // 시간대별 활동
  stats.earlyActivities = profile.activities.filter(a => {
    const hour = new Date(a.createdAt).getHours()
    return hour < 6
  }).length

  stats.lateActivities = profile.activities.filter(a => {
    const hour = new Date(a.createdAt).getHours()
    return hour >= 22
  }).length

  stats.uniqueCategories = new Set(profile.activities.map(a => a.category)).size

  // 현재 활성 도전과제 가져오기
  const achievements = await getCurrentMonthAchievements()

  // 각 도전과제의 진행 상황 업데이트
  for (const achievement of achievements) {
    let progress = 0

    switch (achievement.checkType) {
      case 'totalActivities':
        progress = stats.totalActivities
        break
      case 'consecutiveDays':
        progress = stats.consecutiveDays
        break
      case 'level':
        progress = stats.level
        break
      case 'totalMinutes':
        progress = stats.totalMinutes
        break
      case 'pomodoroSessions':
        progress = stats.pomodoroSessions
        break
      case 'perfectDays':
        progress = stats.perfectDays
        break
      case 'earlyActivities':
        progress = stats.earlyActivities
        break
      case 'lateActivities':
        progress = stats.lateActivities
        break
      case 'uniqueCategories':
        progress = stats.uniqueCategories
        break
      case 'categoryCount':
        const condition = achievement.checkCondition as any
        if (condition?.category) {
          progress = stats[`${condition.category.toLowerCase()}Count`] || 0
        }
        break
      case 'categoryMinutes':
        const minCondition = achievement.checkCondition as any
        if (minCondition?.category) {
          progress = stats[`${minCondition.category.toLowerCase()}Minutes`] || 0
        }
        break
      // 추가 체크 타입은 필요에 따라 구현
    }

    // 진행 상황 업데이트
    await updateUserAchievementProgress(studentId, achievement.code, progress)
  }
}

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

    // 도전과제가 없으면 초기화
    const achievementCount = await prisma.achievement.count()
    if (achievementCount === 0) {
      await initializeAchievements()
    }

    // 도전과제 진행 상황 체크 및 업데이트
    await checkAndUpdateAchievements(user.studentProfile.id)

    // 사용자의 도전과제 가져오기
    const achievements = await getUserAchievements(user.studentProfile.id)

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Achievements error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}