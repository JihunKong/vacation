import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { getSchoolByNeisCode } from "@/lib/school-data"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, termsAccepted, privacyAccepted, neisCode, role } = await req.json()

    // 입력값 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      )
    }
    
    // 약관 동의 확인
    if (!termsAccepted || !privacyAccepted) {
      return NextResponse.json(
        { error: "서비스 이용약관과 개인정보처리방침에 동의해주세요." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      )
    }

    // 학교 정보 확인 (neisCode가 제공된 경우)
    let schoolId: string | undefined = undefined
    
    if (neisCode) {
      // 먼저 DB에 학교가 있는지 확인
      let school = await prisma.school.findUnique({
        where: { neisCode }
      })
      
      // DB에 없으면 학교 데이터에서 찾아서 생성
      if (!school) {
        const schoolData = getSchoolByNeisCode(neisCode)
        if (schoolData) {
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
      }
      
      if (school) {
        schoolId = school.id
      }
    }

    // 역할 검증 (학교가 선택되지 않은 경우 학생으로만 가입 가능)
    const userRole = role === 'TEACHER' && schoolId ? 'TEACHER' : 'STUDENT'

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성 (동의 시간 및 학교 정보 포함)
    const now = new Date()
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        schoolId,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
      },
    })

    // 학생 역할인 경우에만 학생 프로필 생성
    if (userRole === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}