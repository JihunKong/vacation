"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Category, Plan, PlanItem } from "@prisma/client"
import { Sparkles } from "lucide-react"

interface ActivityFormProps {
  studentProfileId: string
  todayPlan?: (Plan & { items: PlanItem[] }) | null
  currentStreak: number
}

const CATEGORY_OPTIONS = [
  { value: Category.STUDY, label: "학습" },
  { value: Category.EXERCISE, label: "운동" },
  { value: Category.READING, label: "독서" },
  { value: Category.HOBBY, label: "취미" },
  { value: Category.VOLUNTEER, label: "봉사" },
  { value: Category.OTHER, label: "기타" },
]

export function ActivityForm({ studentProfileId, todayPlan, currentStreak }: ActivityFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  
  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: Category
    minutes: string
    planItemId: string
  }>({
    title: "",
    description: "",
    category: Category.STUDY,
    minutes: "30",
    planItemId: "",
  })

  // 계획 항목 선택 시 자동 입력
  const handlePlanItemSelect = (itemId: string) => {
    if (itemId === "manual") {
      setFormData({
        ...formData,
        planItemId: "",
        title: "",
        category: Category.STUDY,
        minutes: "30",
      })
      return
    }
    
    const item = todayPlan?.items.find(i => i.id === itemId)
    if (item) {
      setFormData({
        ...formData,
        planItemId: itemId,
        title: item.title,
        category: item.category,
        minutes: item.targetMinutes.toString(),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const minutes = parseInt(formData.minutes)

      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          minutes,
          planItemId: formData.planItemId || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "활동 기록에 실패했습니다")
      }
      
      const result = await response.json()
      setEarnedXP(result.activity.xpEarned)
      setLimitReached(result.dailyLimit?.isLimitReached || false)
      setShowResult(true)
      
      // 3초 후 초기화
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          category: Category.STUDY,
          minutes: "30",
          planItemId: "",
        })
        setShowResult(false)
        router.refresh()
      }, 3000)
    } catch (error) {
      console.error("Error recording activity:", error)
      const errorMessage = error instanceof Error ? error.message : "활동 기록에 실패했습니다"
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const uncompletedItems = todayPlan?.items.filter(item => !item.isCompleted) || []

  return (
    <>
      {showResult ? (
        <div className="text-center py-8 space-y-4">
          <Sparkles className="h-16 w-16 text-yellow-500 mx-auto animate-pulse" />
          <h3 className="text-2xl font-bold">
            +{earnedXP} XP 획득!
          </h3>
          <p className="text-gray-600">
            활동이 성공적으로 기록되었습니다
          </p>
          {limitReached && (
            <Alert className="mt-4">
              <AlertDescription className="text-orange-600">
                ⚠️ 이 카테고리의 일일 제한에 도달했습니다! 
                추가 활동 시 10 XP만 획득합니다.
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {uncompletedItems.length > 0 && (
            <div>
              <Label>오늘의 계획에서 선택</Label>
              <Select
                value={formData.planItemId}
                onValueChange={handlePlanItemSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="계획 항목을 선택하세요 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">직접 입력</SelectItem>
                  {uncompletedItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title} ({item.targetMinutes}분)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">활동명</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 수학 문제집 3단원"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">카테고리</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="minutes">활동 시간 (분)</Label>
            <Input
              id="minutes"
              type="number"
              min="10"
              max="60"
              step="10"
              value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              10분 ~ 60분 (1시간 이상은 여러 세션으로 나누어 기록해주세요)
            </p>
          </div>

          <div>
            <Label htmlFor="description">메모 (선택사항)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="활동에 대한 간단한 메모를 남겨주세요"
              rows={3}
            />
          </div>

          {currentStreak > 0 && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                현재 {currentStreak}일 연속 달성 중! 20% 추가 경험치를 획득합니다.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "기록 중..." : "활동 기록하기"}
          </Button>
        </form>
      )}
    </>
  )
}