import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateLevelImage, CharacterStats } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, studentId, userEmail, serverToken } = body;

    let profile;

    // 서버 사이드 요청인 경우 (내부 API 호출)
    if (serverToken === process.env.NEXTAUTH_SECRET && (studentId || userEmail)) {
      if (studentId) {
        // studentId로 직접 조회
        profile = await prisma.studentProfile.findUnique({
          where: { id: studentId },
          include: {
            user: true
          }
        });
      } else if (userEmail) {
        // userEmail로 사용자 찾아서 studentProfile 조회
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
          include: {
            studentProfile: true
          }
        });
        
        if (user?.studentProfile) {
          profile = { ...user.studentProfile, user };
        }
      }

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
    } else {
      // 클라이언트 요청인 경우 (일반 인증)
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          studentProfile: true
        }
      });

      if (!user?.studentProfile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      profile = user.studentProfile;
    }

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

    // forceGenerate 파라미터로도 재생성 가능하도록 수정
    const shouldRegenerate = req.nextUrl.searchParams.get('regenerate') || body.forceGenerate;
    
    if (existingImage && !shouldRegenerate) {
      return NextResponse.json({
        success: true,
        image: existingImage,
        message: 'Image already exists'
      });
    }

    // 캐릭터 스탯 준비 (개인정보 보호를 위해 이름 제외)
    const stats: CharacterStats = {
      level,
      strength: profile.strength,
      intelligence: profile.intelligence,
      dexterity: profile.dexterity,
      charisma: profile.charisma,
      vitality: profile.vitality,
      totalXP: profile.totalXP,
      totalMinutes: profile.totalMinutes
      // name 필드는 개인정보 보호를 위해 제거
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