import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface Props {
  params: Promise<{ id: string }>
}

// 특정 활동 조회
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
    
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                school: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })
    
    if (!activity) {
      return NextResponse.json(
        { error: "활동을 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ activity })
  } catch (error) {
    console.error("Get activity error:", error)
    return NextResponse.json(
      { error: "활동 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 활동 정보 수정
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
    
    const { title, category, minutes, description, xpEarned } = await req.json()
    
    // 유효성 검증
    if (!title || !category || minutes < 0 || xpEarned < 0) {
      return NextResponse.json(
        { error: "유효하지 않은 데이터입니다." },
        { status: 400 }
      )
    }
    
    // 활동 존재 확인
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    })
    
    if (!existingActivity) {
      return NextResponse.json(
        { error: "활동을 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    
    // XP 차이 계산
    const xpDifference = xpEarned - existingActivity.xpEarned
    
    // 활동 업데이트
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        title,
        category,
        minutes,
        description,
        xpEarned
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                school: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })
    
    // 학생 프로필의 총 XP 업데이트
    if (xpDifference !== 0) {
      const newTotalXP = Math.max(0, existingActivity.student.totalXP + xpDifference)
      const newLevel = Math.floor(Math.sqrt(newTotalXP / 100)) + 1
      
      await prisma.studentProfile.update({
        where: { id: existingActivity.studentId },
        data: {
          totalXP: newTotalXP,
          level: newLevel
        }
      })
    }
    
    return NextResponse.json({ 
      message: "활동 정보가 수정되었습니다.",
      activity: updatedActivity 
    })
  } catch (error) {
    console.error("Update activity error:", error)
    return NextResponse.json(
      { error: "활동 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 활동 삭제
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
    
    // 활동 정보 조회 (XP 차감을 위해)
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        student: true
      }
    })
    
    if (!activity) {
      return NextResponse.json(
        { error: "활동을 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    
    // 활동 삭제
    await prisma.activity.delete({
      where: { id }
    })
    
    // 학생 프로필의 총 XP 차감
    if (activity.student) {
      const newTotalXP = Math.max(0, activity.student.totalXP - activity.xpEarned)
      const newLevel = Math.floor(Math.sqrt(newTotalXP / 100)) + 1
      
      await prisma.studentProfile.update({
        where: { id: activity.studentId },
        data: {
          totalXP: newTotalXP,
          level: newLevel
        }
      })
    }
    
    return NextResponse.json({ 
      message: "활동이 삭제되었습니다." 
    })
  } catch (error) {
    console.error("Delete activity error:", error)
    return NextResponse.json(
      { error: "활동 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}