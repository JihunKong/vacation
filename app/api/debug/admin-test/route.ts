import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// 관리자 CRUD 기능을 직접 테스트하는 API
export async function GET(req: NextRequest) {
  try {
    console.log("Admin test API called")

    // 사용자 목록 조회 테스트
    const users = await prisma.user.findMany({
      include: {
        school: true,
        studentProfile: {
          select: {
            totalXP: true,
            level: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      message: "Admin test successful",
      userCount: users.length,
      users: users.slice(0, 5), // 처음 5명만 반환
      testTime: new Date().toISOString()
    })
  } catch (error) {
    console.error("Admin test error:", error)
    return NextResponse.json(
      { error: "테스트 중 오류가 발생했습니다.", details: error },
      { status: 500 }
    )
  }
}

// 사용자 정보 수정 테스트
export async function PUT(req: NextRequest) {
  try {
    const { userId, newName, newRole } = await req.json()

    console.log("Testing user update:", { userId, newName, newRole })

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      )
    }

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 사용자 정보 업데이트 테스트 (실제로 수정하지 않음)
    const testUpdate = {
      name: newName || existingUser.name,
      role: newRole || existingUser.role
    }

    return NextResponse.json({
      message: "사용자 정보 수정 테스트 성공",
      originalUser: existingUser,
      testUpdate: testUpdate,
      testTime: new Date().toISOString()
    })
  } catch (error) {
    console.error("User update test error:", error)
    return NextResponse.json(
      { error: "사용자 수정 테스트 중 오류가 발생했습니다.", details: error },
      { status: 500 }
    )
  }
}