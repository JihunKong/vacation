import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 관리자용 이미지 URL 업데이트 API
export async function POST(req: NextRequest) {
  try {
    // 서버 내부 토큰 확인 (보안)
    const { imageId, newImageUrl, serverToken } = await req.json();

    const expectedToken = process.env.SERVER_ACTION_TOKEN || 'internal-server-token';
    if (serverToken !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!imageId || !newImageUrl) {
      return NextResponse.json({
        error: 'Missing required fields: imageId, newImageUrl'
      }, { status: 400 });
    }

    // 이미지 URL 업데이트
    const updated = await prisma.levelImage.update({
      where: { id: imageId },
      data: {
        imageUrl: newImageUrl,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Image URL updated',
      imageId: updated.id,
      newUrl: updated.imageUrl
    });

  } catch (error) {
    console.error('Update image URL error:', error);
    return NextResponse.json({
      error: 'Failed to update image URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
