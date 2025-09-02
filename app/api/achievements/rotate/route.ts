import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rotateMonthlyAchievementsV2 } from '@/lib/achievement-rotation-v2'

// POST /api/achievements/rotate - 월별 도전과제 로테이션 (관리자 전용)
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

    // 월별 도전과제 로테이션 실행 (V2 - 모든 도전과제 리셋)
    const newAchievements = await rotateMonthlyAchievementsV2()

    return NextResponse.json({
      message: '월별 도전과제가 성공적으로 업데이트되었습니다',
      achievements: newAchievements
    })
  } catch (error) {
    console.error('Rotation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}