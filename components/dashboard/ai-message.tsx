"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface AIMessageProps {
  studentData: {
    level: number
    totalXP: number
    currentStreak: number
    recentActivity?: string
    strength: number
    intelligence: number
    wisdom: number        // WIS: 지혜 (독서)
    dexterity: number
    charisma: number
    vitality: number
    totalMinutes: number
  }
}

export function AIMessage({ studentData }: AIMessageProps) {
  const [message, setMessage] = useState<string>("오늘도 성장하는 하루 되세요! 🌟")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAIMessage = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/ai/motivation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentData }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch AI message")
      }

      const data = await response.json()
      setMessage(data.message)
      
      // 메시지를 로컬 스토리지에 캐싱 (24시간)
      const cacheData = {
        message: data.message,
        timestamp: Date.now(),
        studentLevel: studentData.level,
      }
      localStorage.setItem("ai-motivation-cache", JSON.stringify(cacheData))
    } catch (error) {
      console.error("Error fetching AI message:", error)
      // 에러 시 기본 메시지 유지
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // 캐시 확인 (24시간 이내 & 같은 레벨)
    const cached = localStorage.getItem("ai-motivation-cache")
    if (cached) {
      try {
        const cacheData = JSON.parse(cached)
        const hoursSinceCache = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60)
        
        if (hoursSinceCache < 24 && cacheData.studentLevel === studentData.level) {
          setMessage(cacheData.message)
          setIsLoading(false)
          return
        }
      } catch (e) {
        console.error("Cache parse error:", e)
      }
    }

    // 캐시가 없거나 만료되면 새로 가져오기
    fetchAIMessage()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAIMessage()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        <Skeleton className="h-6 w-64" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <p className="mt-2 text-gray-600 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        {message}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="ml-2"
        title="새로운 메시지 받기"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}