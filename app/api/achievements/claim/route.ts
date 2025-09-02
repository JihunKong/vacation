import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { claimAchievementReward } from '@/lib/achievement-rotation'

// POST /api/achievements/claim - 도전과제 보상 수령
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { achievementId } = await req.json()

    if (!achievementId) {
      return NextResponse.json({ error: 'Achievement ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { studentProfile: true }
    })

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 보상 수령
    const result = await claimAchievementReward(user.studentProfile.id, achievementId)

    if (!result) {
      return NextResponse.json({ 
        error: '보상을 수령할 수 없습니다. 도전과제를 완료했는지 확인해주세요.' 
      }, { status: 400 })
    }

    return NextResponse.json({
      message: '보상이 성공적으로 수령되었습니다!',
      xpReward: result.userAchievement ? 
        (await prisma.achievement.findUnique({ where: { id: achievementId } }))?.xpReward : 0,
      newLevel: result.profile.level,
      newXP: result.profile.experience
    })
  } catch (error) {
    console.error('Claim reward error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}