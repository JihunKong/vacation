# 04. UI 설정 및 기본 컴포넌트 (계속)

## 7. 애니메이션 컴포넌트

`components/ui/animated-counter.tsx` 파일 생성:

```typescript
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  suffix?: string
}

export function AnimatedCounter({ 
  value, 
  duration = 1, 
  className = "",
  suffix = ""
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCount(value)
    }, 100)

    return () => clearTimeout(timer)
  }, [value])

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {count}
      </motion.span>
      {suffix}
    </motion.span>
  )
}
```

## 8. 카테고리별 GIF 표시 컴포넌트

`components/ui/category-gif.tsx` 파일 생성:

```typescript
"use client"

import { Category } from "@prisma/client"
import Image from "next/image"
import { useState } from "react"

const categoryGifs: Record<Category, string> = {
  STUDY: "https://media.giphy.com/media/IPbS5R4fSUl5S/giphy.gif",
  EXERCISE: "https://media.giphy.com/media/3oKIPavRPgJYaNI97W/giphy.gif",
  READING: "https://media.giphy.com/media/NFA61GS9qKZ68/giphy.gif",
  VOLUNTEER: "https://media.giphy.com/media/3o6ZsZdNs477CyjgOc/giphy.gif",
  HOBBY: "https://media.giphy.com/media/PiQejEf31116URju4V/giphy.gif",
  SOCIAL: "https://media.giphy.com/media/l3q2Hy66w1hpDSWUE/giphy.gif"
}

interface CategoryGifProps {
  category: Category
  size?: number
  className?: string
}

export function CategoryGif({ category, size = 100, className = "" }: CategoryGifProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    // 이미지 로드 실패 시 이모지 표시
    const emojis = {
      STUDY: "📚",
      EXERCISE: "💪",
      READING: "📖",
      VOLUNTEER: "🤝",
      HOBBY: "🎨",
      SOCIAL: "👥"
    }
    
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.5 }}>{emojis[category]}</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Image
        src={categoryGifs[category]}
        alt={category}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setImageError(true)}
        unoptimized // GIF 애니메이션을 위해
      />
    </div>
  )
}
```

## 9. 레벨업 모달

`components/ui/level-up-modal.tsx` 파일 생성:

```typescript
"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import confetti from "canvas-confetti"

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
}

export function LevelUpModal({ isOpen, onClose, newLevel }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      // 색종이 효과
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.5,
                  repeat: 2
                }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-2">레벨 업!</h2>
              <p className="text-xl text-muted-foreground mb-6">
                레벨 {newLevel}을 달성했습니다!
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-sm text-muted-foreground">
                  계속해서 목표를 향해 나아가세요! 💪
                </p>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
```

## 10. 통계 차트 컴포넌트

`components/ui/stats-chart.tsx` 파일 생성:

```typescript
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"

interface CategoryStats {
  category: string
  time: number
  label: string
}

interface StatsChartProps {
  data: CategoryStats[]
  type?: "radar" | "bar"
}

export function StatsChart({ data, type = "radar" }: StatsChartProps) {
  if (type === "radar") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 활동 균형</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="label" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="활동시간" 
                dataKey="time" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>카테고리별 활동 시간</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="time" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

## 11. 에러 바운더리

`components/ui/error-boundary.tsx` 파일 생성:

```typescript
"use client"

import { Component, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>오류가 발생했습니다</CardTitle>
            </div>
            <CardDescription>
              잠시 후 다시 시도해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              새로고침
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
```

## 12. 날짜 포맷 유틸리티

`lib/utils/date.ts` 파일 생성:

```typescript
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import { ko } from "date-fns/locale"

export function formatDate(date: Date | string, formatStr: string = "yyyy-MM-dd"): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, formatStr, { locale: ko })
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  
  if (isToday(d)) {
    return "오늘"
  }
  
  if (isYesterday(d)) {
    return "어제"
  }
  
  return formatDistanceToNow(d, { addSuffix: true, locale: ko })
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}분`
  }
  
  if (mins === 0) {
    return `${hours}시간`
  }
  
  return `${hours}시간 ${mins}분`
}
```

## 13. 토스트 유틸리티

`lib/utils/toast.ts` 파일 생성:

```typescript
import { toast } from "@/components/ui/use-toast"

export const showToast = {
  success: (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3000,
    })
  },
  
  error: (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "destructive",
      duration: 4000,
    })
  },
  
  loading: (message: string) => {
    return toast({
      title: message,
      duration: Infinity,
    })
  }
}
```

## 14. 반응형 유틸리티 훅

`lib/hooks/use-media-query.ts` 파일 생성:

```typescript
"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

export const useIsMobile = () => useMediaQuery("(max-width: 768px)")
export const useIsTablet = () => useMediaQuery("(max-width: 1024px)")
```

## 다음 단계
UI 컴포넌트 설정이 완료되었습니다. 다음은 `05-api-endpoints.md`를 참고하여 API 엔드포인트를 구현하세요.