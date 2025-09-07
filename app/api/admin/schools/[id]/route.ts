import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface Props {
  params: Promise<{ id: string }>
}

// 특정 학교 조회
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
    
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })
    
    if (!school) {
      return NextResponse.json(
        { error: "학교를 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ school })
  } catch (error) {
    console.error("Get school error:", error)
    return NextResponse.json(
      { error: "학교 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 학교 정보 수정
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
    
    const { name, neisCode, schoolType } = await req.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "학교명을 입력해주세요." },
        { status: 400 }
      )
    }
    
    // 나이스 코드 중복 확인 (자기 자신 제외)
    if (neisCode) {
      const existingSchool = await prisma.school.findFirst({
        where: { 
          neisCode: neisCode.trim(),
          NOT: { id }
        }
      })
      
      if (existingSchool) {
        return NextResponse.json(
          { error: "이미 등록된 나이스 코드입니다." },
          { status: 400 }
        )
      }
    }
    
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: {
        name: name.trim(),
        ...(neisCode && { neisCode: neisCode.trim() }),
        ...(schoolType && { schoolType })
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })
    
    return NextResponse.json({ 
      message: "학교 정보가 수정되었습니다.",
      school: updatedSchool 
    })
  } catch (error) {
    console.error("Update school error:", error)
    return NextResponse.json(
      { error: "학교 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 학교 삭제
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
    
    // 학교에 속한 사용자가 있는지 확인
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })
    
    if (!school) {
      return NextResponse.json(
        { error: "학교를 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    
    if (school._count.users > 0) {
      return NextResponse.json(
        { error: `이 학교에는 ${school._count.users}명의 사용자가 등록되어 있습니다. 먼저 사용자들의 학교 정보를 변경해주세요.` },
        { status: 400 }
      )
    }
    
    await prisma.school.delete({
      where: { id }
    })
    
    return NextResponse.json({ 
      message: "학교가 삭제되었습니다." 
    })
  } catch (error) {
    console.error("Delete school error:", error)
    return NextResponse.json(
      { error: "학교 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}