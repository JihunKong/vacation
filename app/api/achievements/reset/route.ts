import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/achievements/reset - 도전과제 수동 리셋 (관리자 전용)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 관리자 권한 체크 (선생님 역할)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // 모든 사용자의 도전과제 진행 상황 리셋
    const result = await prisma.userAchievement.updateMany({
      where: {
        completed: false // 미완료 도전과제만 리셋
      },
      data: {
        progress: 0,
        updatedAt: new Date()
      }
    })

    // 완료된 도전과제도 리셋할지 옵션
    const { resetCompleted } = await req.json().catch(() => ({ resetCompleted: false }))
    
    if (resetCompleted) {
      await prisma.userAchievement.updateMany({
        data: {
          progress: 0,
          completed: false,
          completedAt: null,
          claimedReward: false,
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json({
        message: '모든 도전과제가 완전히 리셋되었습니다',
        resetCount: await prisma.userAchievement.count()
      })
    }

    return NextResponse.json({
      message: '미완료 도전과제가 리셋되었습니다',
      resetCount: result.count
    })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}