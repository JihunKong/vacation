import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const where = {
      userId: session.user.id,
      ...(unreadOnly && { isRead: false })
    }

    // 알림 조회
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // 읽지 않은 알림 수
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "알림을 불러오는 데 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAsRead = true } = body

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: "알림 ID가 필요합니다." }, { status: 400 })
    }

    // 알림 읽음 처리 (본인의 알림만)
    const updateResult = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id
      },
      data: {
        isRead: markAsRead,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `${updateResult.count}개의 알림이 ${markAsRead ? '읽음' : '읽지 않음'} 처리되었습니다.`,
      updatedCount: updateResult.count
    })

  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      { error: "알림 상태 업데이트에 실패했습니다." },
      { status: 500 }
    )
  }
}