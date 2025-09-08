import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'TEACHER' && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { schoolId } = await req.json();

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    // 학교 존재 확인
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // 학생 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { schoolId },
      include: {
        school: true,
        studentProfile: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `학생의 학교가 ${school.name}으로 변경되었습니다.`
    });

  } catch (error) {
    console.error('Failed to update student school:', error);
    return NextResponse.json(
      { error: 'Failed to update student school' },
      { status: 500 }
    );
  }
}