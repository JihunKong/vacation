import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateLevelImage, CharacterStats } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자 프로필 가져오기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        studentProfile: true
      }
    });

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = user.studentProfile;
    const { level } = await req.json();

    // 레벨 유효성 검사 (10의 배수만 허용)
    if (!level || level % 10 !== 0 || level > profile.level) {
      return NextResponse.json({ 
        error: 'Invalid level. Must be a multiple of 10 and not exceed current level.' 
      }, { status: 400 });
    }

    // 이미 생성된 이미지가 있는지 확인
    const existingImage = await prisma.levelImage.findFirst({
      where: {
        studentId: profile.id,
        level: level
      }
    });

    if (existingImage && !req.nextUrl.searchParams.get('regenerate')) {
      return NextResponse.json({
        success: true,
        image: existingImage,
        message: 'Image already exists'
      });
    }

    // 캐릭터 스탯 준비
    const stats: CharacterStats = {
      level,
      strength: profile.strength,
      intelligence: profile.intelligence,
      dexterity: profile.dexterity,
      charisma: profile.charisma,
      vitality: profile.vitality,
      totalXP: profile.totalXP,
      totalMinutes: profile.totalMinutes,
      name: user.name || undefined
    };

    // 이미지 생성
    const result = await generateLevelImage(stats);

    if (!result.success || !result.imageUrl) {
      return NextResponse.json({ 
        error: result.error || 'Failed to generate image' 
      }, { status: 500 });
    }

    // 데이터베이스에 저장
    const levelImage = await prisma.levelImage.upsert({
      where: {
        id: existingImage?.id || 'new'
      },
      update: {
        imageUrl: result.imageUrl,
        prompt: result.prompt || '',
        strength: profile.strength,
        intelligence: profile.intelligence,
        dexterity: profile.dexterity,
        charisma: profile.charisma,
        vitality: profile.vitality,
        totalXP: profile.totalXP,
        totalMinutes: profile.totalMinutes,
        updatedAt: new Date()
      },
      create: {
        studentId: profile.id,
        level,
        imageUrl: result.imageUrl,
        prompt: result.prompt || '',
        strength: profile.strength,
        intelligence: profile.intelligence,
        dexterity: profile.dexterity,
        charisma: profile.charisma,
        vitality: profile.vitality,
        totalXP: profile.totalXP,
        totalMinutes: profile.totalMinutes
      }
    });

    return NextResponse.json({
      success: true,
      image: levelImage,
      message: existingImage ? 'Image regenerated successfully' : 'Image generated successfully'
    });

  } catch (error) {
    console.error('Generate level image error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}