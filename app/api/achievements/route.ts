import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  target: number
  xpReward: number
  checkProgress: (data: any) => number
}

// 업적 정의
const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_activity',
    title: '첫 걸음',
    description: '첫 활동을 기록하세요',
    icon: '👶',
    target: 1,
    xpReward: 10,
    checkProgress: (data) => data.totalActivities >= 1 ? 1 : 0
  },
  {
    id: 'week_warrior',
    title: '주간 전사',
    description: '일주일 연속 활동 기록하기',
    icon: '⚔️',
    target: 7,
    xpReward: 50,
    checkProgress: (data) => data.consecutiveDays
  },
  {
    id: 'study_master_10',
    title: '학습 마스터 I',
    description: '학습 활동 10회 완료',
    icon: '📚',
    target: 10,
    xpReward: 30,
    checkProgress: (data) => data.studyActivities
  },
  {
    id: 'exercise_champion_10',
    title: '운동 챔피언 I',
    description: '운동 활동 10회 완료',
    icon: '💪',
    target: 10,
    xpReward: 30,
    checkProgress: (data) => data.exerciseActivities
  },
  {
    id: 'reading_lover_10',
    title: '독서왕 I',
    description: '독서 활동 10회 완료',
    icon: '📖',
    target: 10,
    xpReward: 30,
    checkProgress: (data) => data.readingActivities
  },
  {
    id: 'level_10',
    title: '레벨 10 달성',
    description: '레벨 10에 도달하세요',
    icon: '🏆',
    target: 10,
    xpReward: 100,
    checkProgress: (data) => data.level >= 10 ? 10 : data.level
  },
  {
    id: 'perfect_day',
    title: '완벽한 하루',
    description: '일일 계획 100% 달성',
    icon: '✨',
    target: 1,
    xpReward: 20,
    checkProgress: (data) => data.perfectDays
  },
  {
    id: 'pomodoro_master',
    title: '뽀모도로 마스터',
    description: '뽀모도로 세션 25회 완료',
    icon: '🍅',
    target: 25,
    xpReward: 50,
    checkProgress: (data) => data.pomodoroSessions
  },
  {
    id: 'early_bird',
    title: '얼리버드',
    description: '오전 6시 이전 활동 5회',
    icon: '🌅',
    target: 5,
    xpReward: 30,
    checkProgress: (data) => data.earlyActivities
  },
  {
    id: 'night_owl',
    title: '올빼미',
    description: '오후 10시 이후 활동 5회',
    icon: '🦉',
    target: 5,
    xpReward: 30,
    checkProgress: (data) => data.lateActivities
  },
  {
    id: 'total_hours_100',
    title: '100시간 달성',
    description: '총 학습 시간 100시간',
    icon: '⏰',
    target: 100,
    xpReward: 200,
    checkProgress: (data) => Math.min(data.totalHours, 100)
  },
  {
    id: 'balanced_life',
    title: '균형잡힌 삶',
    description: '모든 카테고리 활동 기록',
    icon: '⚖️',
    target: 6,
    xpReward: 50,
    checkProgress: (data) => data.uniqueCategories
  }
]

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
            activities: true,
            badges: true,
            pomodoroSessions: {
              where: { isCompleted: true }
            },
            plans: {
              include: { items: true }
            }
          }
        }
      }
    })

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profile = user.studentProfile

    // 통계 데이터 수집
    const stats = {
      totalActivities: profile.activities.length,
      studyActivities: profile.activities.filter(a => a.category === 'STUDY').length,
      exerciseActivities: profile.activities.filter(a => a.category === 'EXERCISE').length,
      readingActivities: profile.activities.filter(a => a.category === 'READING').length,
      level: profile.level,
      pomodoroSessions: profile.pomodoroSessions.length,
      totalHours: Math.floor(profile.totalMinutes / 60),
      uniqueCategories: new Set(profile.activities.map(a => a.category)).size,
      consecutiveDays: 0,
      perfectDays: 0,
      earlyActivities: 0,
      lateActivities: 0
    }

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

    // 시간대별 활동 계산
    profile.activities.forEach(activity => {
      const hour = new Date(activity.createdAt).getHours()
      if (hour < 6) stats.earlyActivities++
      if (hour >= 22) stats.lateActivities++
    })

    // 업적 진행도 계산
    const achievements = ACHIEVEMENT_DEFINITIONS.map(def => {
      const progress = def.checkProgress(stats)
      const unlocked = progress >= def.target

      // 이미 획득한 배지 확인
      const existingBadge = profile.badges.find(b => 
        b.type === 'STUDY_MASTER' && b.tier === 1 // 임시 매핑
      )

      return {
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        progress,
        target: def.target,
        unlocked,
        unlockedAt: existingBadge?.earnedAt.toISOString(),
        xpReward: def.xpReward
      }
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Achievements error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}