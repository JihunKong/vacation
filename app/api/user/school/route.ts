import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { searchSchoolsFromNEIS } from "@/lib/neis-api"

// 현재 사용자의 학교 정보 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        school: true
      }
    })
    
    return NextResponse.json({
      schoolId: user?.schoolId,
      school: user?.school,
      role: user?.role
    })
  } catch (error) {
    console.error("Get school info error:", error)
    return NextResponse.json(
      { error: "학교 정보 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 학교 정보 업데이트
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      )
    }
    
    const { neisCode, role } = await req.json()
    
    if (!neisCode) {
      return NextResponse.json(
        { error: "학교 코드를 입력해주세요." },
        { status: 400 }
      )
    }
    
    // 기존 사용자 정보 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    
    // 이미 학교가 설정된 경우 - 변경 가능하도록 수정
    // (주의: 교사 역할로는 변경 불가)
    
    // 학교 정보 확인 또는 생성
    let school = await prisma.school.findUnique({
      where: { neisCode }
    })
    
    if (!school) {
      // NEIS API를 통해 학교 정보 검증
      const schools = await searchSchoolsFromNEIS(neisCode)
      const schoolData = schools.find(s => s.neisCode === neisCode)
      
      if (!schoolData) {
        return NextResponse.json(
          { error: "유효하지 않은 학교 코드입니다." },
          { status: 400 }
        )
      }
      
      school = await prisma.school.create({
        data: {
          neisCode: schoolData.neisCode,
          name: schoolData.name,
          region: schoolData.region,
          district: schoolData.district,
          address: schoolData.address,
          schoolType: schoolData.schoolType
        }
      })
    }
    
    // 역할 결정
    let userRole = existingUser.role
    
    // 학교 변경 시에는 역할 변경 불가
    if (existingUser.schoolId && role && role !== existingUser.role) {
      return NextResponse.json(
        { error: "학교 변경 시 역할은 변경할 수 없습니다." },
        { status: 400 }
      )
    }
    
    // 처음 설정 시 역할 선택 가능
    if (!existingUser.schoolId) {
      if (role === 'TEACHER' && !existingUser.studentProfile) {
        userRole = 'TEACHER'
      } else if (role === 'TEACHER' && existingUser.studentProfile) {
        return NextResponse.json(
          { error: "이미 학생으로 활동 중인 계정은 교사로 변경할 수 없습니다." },
          { status: 400 }
        )
      }
    }
    
    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        schoolId: school.id,
        role: userRole
      },
      include: {
        school: true
      }
    })
    
    return NextResponse.json({
      message: "학교 정보가 성공적으로 설정되었습니다.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        school: updatedUser.school
      }
    })
  } catch (error) {
    console.error("Update school error:", error)
    return NextResponse.json(
      { error: "학교 정보 설정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}