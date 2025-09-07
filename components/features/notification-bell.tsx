"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, MessageCircle, Heart, Trophy, TrendingUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Notification {
  id: string
  type: "FEEDBACK" | "ENCOURAGEMENT" | "ACHIEVEMENT" | "LEVEL_UP" | "SYSTEM"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedId?: string
  relatedType?: string
}

interface NotificationBellProps {
  className?: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "FEEDBACK":
      return <MessageCircle className="w-4 h-4 text-blue-500" />
    case "ENCOURAGEMENT":
      return <Heart className="w-4 h-4 text-pink-500" />
    case "ACHIEVEMENT":
      return <Trophy className="w-4 h-4 text-yellow-500" />
    case "LEVEL_UP":
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case "SYSTEM":
      return <Info className="w-4 h-4 text-gray-500" />
    default:
      return <Bell className="w-4 h-4 text-gray-500" />
  }
}

export default function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 알림 조회
  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications?limit=10")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 알림 읽음 처리
  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationIds,
          markAsRead: true,
        }),
      })

      if (response.ok) {
        // 로컬 상태 업데이트
        setNotifications(prev =>
          prev.map(notification =>
            notificationIds.includes(notification.id)
              ? { ...notification, isRead: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  // 컴포넌트 마운트 시 알림 조회
  useEffect(() => {
    fetchNotifications()
    
    // 30초마다 알림 확인
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  // 드롭다운 열릴 때 읽지 않은 알림을 읽음 처리
  const handleToggle = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    
    if (newIsOpen) {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      if (unreadNotifications.length > 0) {
        markAsRead(unreadNotifications.map(n => n.id))
      }
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "방금"
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    return `${Math.floor(diffInMinutes / 1440)}일 전`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`relative ${className}`}
        onClick={handleToggle}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
        <span className="sr-only">알림</span>
      </Button>
      
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">알림</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNotifications()}
                disabled={isLoading}
                className="h-8 px-2"
              >
                새로고침
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="p-3 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <Button variant="ghost" size="sm" className="w-full">
                모든 알림 보기
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}