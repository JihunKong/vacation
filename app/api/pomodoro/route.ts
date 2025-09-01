import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Category } from '@prisma/client'
import { TimerService } from '@/lib/redis'

// GET: 현재 활성 세션 조회
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

    // 현재 활성 세션 조회 (완료되지 않은 세션)
    const activeSession = await prisma.pomodoroSession.findFirst({
      where: {
        studentId: user.studentProfile.id,
        isCompleted: false
      },
      orderBy: { startTime: 'desc' }
    })

    // 오늘의 완료된 세션들
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaySessions = await prisma.pomodoroSession.findMany({
      where: {
        studentId: user.studentProfile.id,
        isCompleted: true,
        startTime: { gte: today }
      },
      orderBy: { startTime: 'desc' }
    })

    return NextResponse.json({
      activeSession,
      todaySessions,
      stats: {
        totalSessions: todaySessions.length,
        totalMinutes: todaySessions.reduce((sum, s) => sum + (s.actualMinutes || 0), 0),
        totalXP: todaySessions.reduce((sum, s) => sum + s.bonusXP, 0)
      }
    })
  } catch (error) {
    console.error('Pomodoro GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 새 세션 시작
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, title, targetMinutes = 25, isBreak = false } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { studentProfile: true }
    })

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 기존 활성 세션이 있는지 확인
    const existingSession = await prisma.pomodoroSession.findFirst({
      where: {
        studentId: user.studentProfile.id,
        isCompleted: false
      }
    })

    if (existingSession) {
      return NextResponse.json({ error: 'Active session already exists' }, { status: 400 })
    }

    // 새 세션 생성
    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        studentId: user.studentProfile.id,
        category: category as Category,
        title,
        targetMinutes,
        isBreak,
        startTime: new Date()
      }
    })

    // Redis에 타이머 세션 저장 (서버 사이드 타이머)
    await TimerService.setTimerSession(user.id, {
      sessionId: pomodoroSession.id,
      studentId: user.studentProfile.id,
      category,
      title,
      targetMinutes,
      isBreak,
      startTime: pomodoroSession.startTime.toISOString()
    })

    return NextResponse.json(pomodoroSession)
  } catch (error) {
    console.error('Pomodoro POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: 세션 완료/취소
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, action } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { studentProfile: true }
    })

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const pomodoroSession = await prisma.pomodoroSession.findFirst({
      where: {
        id: sessionId,
        studentId: user.studentProfile.id
      }
    })

    if (!pomodoroSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const endTime = new Date()
    const actualMinutes = Math.floor((endTime.getTime() - pomodoroSession.startTime.getTime()) / 60000)

    if (action === 'complete') {
      // 세션 완료 처리
      const isFullSession = actualMinutes >= pomodoroSession.targetMinutes * 0.9 // 90% 이상 완료시 인정
      let bonusXP = 0

      // 휴식 시간이 아닌 경우에만 활동 기록 생성
      if (!pomodoroSession.isBreak && isFullSession) {
        // XP 계산
        const baseXP = Math.floor(actualMinutes * 2)
        
        // 연속 세션 보너스 체크
        const recentSessions = await prisma.pomodoroSession.findMany({
          where: {
            studentId: user.studentProfile.id,
            isCompleted: true,
            isBreak: false,
            endTime: {
              gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2시간 이내
            }
          },
          orderBy: { endTime: 'desc' },
          take: 3
        })

        if (recentSessions.length >= 2) bonusXP += 20 // 3연속 세션 보너스
        else if (recentSessions.length >= 1) bonusXP += 10 // 2연속 세션 보너스

        // 활동 기록 생성
        const activity = await prisma.activity.create({
          data: {
            studentId: user.studentProfile.id,
            title: pomodoroSession.title || `${pomodoroSession.category} 뽀모도로`,
            category: pomodoroSession.category,
            minutes: actualMinutes,
            date: new Date(),
            xpEarned: baseXP + bonusXP,
            statPoints: getStatPoints(pomodoroSession.category, actualMinutes)
          }
        })

        // 프로필 업데이트
        await prisma.studentProfile.update({
          where: { id: user.studentProfile.id },
          data: {
            experience: { increment: baseXP + bonusXP },
            totalXP: { increment: baseXP + bonusXP },
            totalMinutes: { increment: actualMinutes }
          }
        })

        // 세션 업데이트 (활동 연결)
        await prisma.pomodoroSession.update({
          where: { id: sessionId },
          data: {
            endTime,
            actualMinutes,
            isCompleted: true,
            bonusXP,
            activityId: activity.id
          }
        })
      } else {
        // 휴식 시간이거나 미완료 세션
        await prisma.pomodoroSession.update({
          where: { id: sessionId },
          data: {
            endTime,
            actualMinutes,
            isCompleted: true,
            bonusXP: 0
          }
        })
      }

      // Redis에서 타이머 세션 삭제
      await TimerService.clearTimerSession(user.id)

      return NextResponse.json({ 
        success: true, 
        actualMinutes, 
        bonusXP,
        isFullSession 
      })
    } else if (action === 'cancel') {
      // 세션 취소
      await prisma.pomodoroSession.update({
        where: { id: sessionId },
        data: {
          endTime,
          actualMinutes,
          isCompleted: true  // 취소된 세션도 완료된 것으로 처리하여 새 세션 시작 가능
        }
      })

      // Redis에서 타이머 세션 삭제
      await TimerService.clearTimerSession(user.id)

      return NextResponse.json({ success: true, cancelled: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Pomodoro PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 카테고리별 스탯 포인트 계산
function getStatPoints(category: Category, minutes: number) {
  const points = Math.floor(minutes / 10)
  
  switch (category) {
    case 'STUDY':
    case 'READING':
      return { strength: 0, intelligence: points, dexterity: 0, charisma: 0, vitality: 0 }
    case 'EXERCISE':
      return { strength: points, intelligence: 0, dexterity: 0, charisma: 0, vitality: 0 }
    case 'HOBBY':
      return { strength: 0, intelligence: 0, dexterity: points, charisma: 0, vitality: 0 }
    case 'VOLUNTEER':
      return { strength: 0, intelligence: 0, dexterity: 0, charisma: points, vitality: 0 }
    default:
      return { strength: 0, intelligence: 0, dexterity: 0, charisma: 0, vitality: points }
  }
}