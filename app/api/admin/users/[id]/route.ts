import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface Props {
  params: Promise<{ id: string }>
}

// 특정 사용자 조회
export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        school: true,
        studentProfile: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "사용자 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 사용자 정보 수정
export async function PUT(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }
    
    const { name, role, schoolId } = await req.json()
    
    // 현재 사용자 정보 확인
    const currentUser = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    })
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    
    // 역할 변경 시 처리
    if (role && role !== currentUser.role) {
      // STUDENT로 변경 시 프로필 생성
      if (role === 'STUDENT' && !currentUser.studentProfile) {
        await prisma.studentProfile.create({
          data: {
            userId: id,
            totalXP: 0,
            level: 1
          }
        })
      }
      // STUDENT에서 다른 역할로 변경 시 프로필 삭제
      else if (currentUser.role === 'STUDENT' && role !== 'STUDENT') {
        await prisma.studentProfile.delete({
          where: { userId: id }
        })
      }
    }
    
    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(schoolId !== undefined && { schoolId })
      },
      include: {
        school: true,
        studentProfile: true
      }
    })
    
    return NextResponse.json({ 
      message: "사용자 정보가 수정되었습니다.",
      user: updatedUser 
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "사용자 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 사용자 삭제
export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }
    
    // 자기 자신은 삭제할 수 없음
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "자기 자신은 삭제할 수 없습니다." },
        { status: 400 }
      )
    }
    
    // 사용자 삭제 (관련 데이터는 cascade로 자동 삭제)
    await prisma.user.delete({
      where: { id }
    })
    
    return NextResponse.json({ 
      message: "사용자가 삭제되었습니다." 
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: "사용자 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}