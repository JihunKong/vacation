import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TimerService } from '@/lib/redis'

// GET: 타이머 상태 확인
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

    // Redis에서 타이머 세션 조회
    const timerSession = await TimerService.getTimerSession(user.id)
    
    if (!timerSession) {
      return NextResponse.json({ 
        hasActiveTimer: false,
        message: 'No active timer found'
      })
    }

    // DB에서 실제 세션 정보 조회
    const dbSession = await prisma.pomodoroSession.findFirst({
      where: {
        id: timerSession.sessionId,
        studentId: user.studentProfile.id,
        isCompleted: false
      }
    })

    if (!dbSession) {
      // Redis에는 있지만 DB에는 없는 경우 - Redis 정리
      await TimerService.clearTimerSession(user.id)
      return NextResponse.json({ 
        hasActiveTimer: false,
        message: 'Session not found in database'
      })
    }

    // 타이머가 만료된 경우 자동 완료 처리
    if (timerSession.isExpired) {
      const actualMinutes = timerSession.targetMinutes
      const isFullSession = true // 타이머가 만료되었으므로 완전히 완료된 것으로 간주
      
      // 휴식이 아닌 경우 활동 기록 생성
      if (!dbSession.isBreak) {
        const baseXP = Math.floor(actualMinutes * 2)
        const bonusXP = 10 // 타이머 완료 보너스
        
        const activity = await prisma.activity.create({
          data: {
            studentId: user.studentProfile.id,
            title: dbSession.title || `${dbSession.category} 뽀모도로`,
            category: dbSession.category,
            minutes: actualMinutes,
            date: new Date(),
            xpEarned: baseXP + bonusXP,
            statPoints: getStatPoints(dbSession.category, actualMinutes)
          }
        })

        await prisma.studentProfile.update({
          where: { id: user.studentProfile.id },
          data: {
            experience: { increment: baseXP + bonusXP },
            totalXP: { increment: baseXP + bonusXP },
            totalMinutes: { increment: actualMinutes }
          }
        })

        await prisma.pomodoroSession.update({
          where: { id: dbSession.id },
          data: {
            endTime: new Date(),
            actualMinutes,
            isCompleted: true,
            bonusXP,
            activityId: activity.id
          }
        })
      } else {
        await prisma.pomodoroSession.update({
          where: { id: dbSession.id },
          data: {
            endTime: new Date(),
            actualMinutes,
            isCompleted: true,
            bonusXP: 0
          }
        })
      }

      // Redis에서 세션 삭제
      await TimerService.clearTimerSession(user.id)

      return NextResponse.json({
        hasActiveTimer: false,
        timerExpired: true,
        sessionCompleted: true,
        actualMinutes,
        message: 'Timer expired and session completed'
      })
    }

    // 타이머가 아직 활성 상태
    return NextResponse.json({
      hasActiveTimer: true,
      session: {
        ...dbSession,
        remainingSeconds: timerSession.remainingSeconds,
        expectedEndTime: timerSession.expectedEndTime
      }
    })
  } catch (error) {
    console.error('Timer status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 카테고리별 스탯 포인트 계산
function getStatPoints(category: any, minutes: number) {
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