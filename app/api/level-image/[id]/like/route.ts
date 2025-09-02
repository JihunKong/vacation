import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 이미지 존재 확인
    const image = await prisma.levelImage.findUnique({
      where: { id }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // 이미 좋아요 했는지 확인
    const existingLike = await prisma.levelImageLike.findUnique({
      where: {
        userId_levelImageId: {
          userId: user.id,
          levelImageId: id
        }
      }
    });

    let isLiked: boolean;
    let updatedImage;

    if (existingLike) {
      // 좋아요 취소
      await prisma.$transaction([
        prisma.levelImageLike.delete({
          where: { id: existingLike.id }
        }),
        prisma.levelImage.update({
          where: { id },
          data: {
            likes: {
              decrement: 1
            }
          }
        })
      ]);
      
      isLiked = false;
      updatedImage = await prisma.levelImage.findUnique({
        where: { id }
      });
    } else {
      // 좋아요 추가
      await prisma.$transaction([
        prisma.levelImageLike.create({
          data: {
            userId: user.id,
            levelImageId: id
          }
        }),
        prisma.levelImage.update({
          where: { id },
          data: {
            likes: {
              increment: 1
            }
          }
        })
      ]);
      
      isLiked = true;
      updatedImage = await prisma.levelImage.findUnique({
        where: { id }
      });
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likes: updatedImage?.likes || 0
    });

  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ 
      error: 'Failed to toggle like' 
    }, { status: 500 });
  }
}

// GET 요청으로 좋아요 상태 확인
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ isLiked: false });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ isLiked: false });
    }

    const like = await prisma.levelImageLike.findUnique({
      where: {
        userId_levelImageId: {
          userId: user.id,
          levelImageId: id
        }
      }
    });

    return NextResponse.json({
      isLiked: !!like
    });

  } catch (error) {
    console.error('Check like error:', error);
    return NextResponse.json({ isLiked: false });
  }
}