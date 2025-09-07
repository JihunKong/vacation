import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 모든 사용자 조회
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
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: "사용자 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 새 사용자 생성 (필요시 사용)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }
    
    const { email, name, password, role } = await req.json()
    
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 존재하는 이메일입니다." },
        { status: 400 }
      )
    }
    
    // 사용자 생성
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'STUDENT'
      }
    })
    
    // 학생인 경우 프로필 생성
    if (user.role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          totalXP: 0,
          level: 1
        }
      })
    }
    
    return NextResponse.json({ 
      message: "사용자가 생성되었습니다.",
      user 
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { error: "사용자 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}