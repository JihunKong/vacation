import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateLevelImage, CharacterStats } from '@/lib/gemini';

// Test endpoint for manually triggering image generation
export async function GET(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 또는 교사 권한 확인
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        studentProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 테스트용 레벨 파라미터
    const searchParams = req.nextUrl.searchParams;
    const testLevel = parseInt(searchParams.get('level') || '10');
    const targetEmail = searchParams.get('email') || session.user.email;

    // 대상 사용자 찾기
    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        studentProfile: true
      }
    });

    if (!targetUser?.studentProfile) {
      return NextResponse.json({ error: 'Target user profile not found' }, { status: 404 });
    }

    const profile = targetUser.studentProfile;

    // 테스트용 스탯 (실제 프로필 데이터 사용)
    const stats: CharacterStats = {
      level: testLevel,
      strength: profile.strength,
      intelligence: profile.intelligence,
      dexterity: profile.dexterity,
      charisma: profile.charisma,
      vitality: profile.vitality,
      totalXP: profile.totalXP,
      totalMinutes: profile.totalMinutes,
      name: targetUser.name || undefined
    };

    // 이미지 생성 테스트
    console.log('Testing image generation for:', stats);
    const result = await generateLevelImage(stats);

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to generate test image',
        details: result
      }, { status: 500 });
    }

    // 테스트 모드에서는 DB에 저장하지 않음
    return NextResponse.json({
      success: true,
      message: 'Test image generated successfully',
      imageUrl: result.imageUrl,
      prompt: result.prompt,
      stats: stats,
      note: 'This is a test endpoint. Image was generated but not saved to database.'
    });

  } catch (error) {
    console.error('Test image generation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}