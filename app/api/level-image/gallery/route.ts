import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 쿼리 조건 설정
    const where: any = {
      isPublic: true
    };

    if (level) {
      where.level = parseInt(level);
    }

    // 최고 레벨 이미지 (명예의 전당)
    const hallOfFame = await prisma.levelImage.findFirst({
      where: {
        isPublic: true
      },
      orderBy: [
        { level: 'desc' },
        { totalXP: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // 갤러리 이미지 목록
    const images = await prisma.levelImage.findMany({
      where,
      orderBy: [
        { level: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: offset,
      take: limit,
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // 총 개수
    const total = await prisma.levelImage.count({ where });

    // 레벨별 통계
    const levelStats = await prisma.levelImage.groupBy({
      by: ['level'],
      where: {
        isPublic: true
      },
      _count: {
        id: true
      },
      orderBy: {
        level: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      hallOfFame,
      images,
      total,
      levelStats,
      pagination: {
        limit,
        offset,
        hasMore: offset + images.length < total
      }
    });

  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch gallery' 
    }, { status: 500 });
  }
}