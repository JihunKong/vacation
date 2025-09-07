import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 모든 학교 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 관리자 권한 확인
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }
    
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json({ schools })
  } catch (error) {
    console.error("Get schools error:", error)
    return NextResponse.json(
      { error: "학교 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 새 학교 생성
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }
    
    const { name, neisCode, schoolType } = await req.json()
    
    if (!name || !name.trim() || !neisCode || !schoolType) {
      return NextResponse.json(
        { error: "학교명, 나이스 코드, 학교 유형을 모두 입력해주세요." },
        { status: 400 }
      )
    }
    
    // 중복 확인 (나이스 코드로)
    const existingSchool = await prisma.school.findFirst({
      where: { 
        neisCode: neisCode.trim() 
      }
    })
    
    if (existingSchool) {
      return NextResponse.json(
        { error: "이미 등록된 나이스 코드입니다." },
        { status: 400 }
      )
    }
    
    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        neisCode: neisCode.trim(),
        schoolType: schoolType
      }
    })
    
    return NextResponse.json({ 
      message: "학교가 생성되었습니다.",
      school 
    })
  } catch (error) {
    console.error("Create school error:", error)
    return NextResponse.json(
      { error: "학교 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}