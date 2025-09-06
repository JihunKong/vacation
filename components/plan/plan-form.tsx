"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import { Category, Plan, PlanItem } from "@prisma/client"

interface PlanFormProps {
  studentProfileId: string
  existingPlan?: (Plan & { items: PlanItem[] }) | null
}

interface PlanItemForm {
  id?: string
  title: string
  category: Category
  targetMinutes: string
}

const CATEGORY_OPTIONS = [
  { value: Category.STUDY, label: "학습" },
  { value: Category.EXERCISE, label: "운동" },
  { value: Category.READING, label: "독서" },
  { value: Category.HOBBY, label: "취미" },
  { value: Category.VOLUNTEER, label: "봉사" },
  { value: Category.OTHER, label: "기타" },
]

export function PlanForm({ studentProfileId, existingPlan }: PlanFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [items, setItems] = useState<PlanItemForm[]>(
    existingPlan?.items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      targetMinutes: item.targetMinutes.toString(),
    })) || [
      { title: "", category: Category.STUDY, targetMinutes: "30" }
    ]
  )

  const addItem = () => {
    setItems([...items, { title: "", category: Category.STUDY, targetMinutes: "30" }])
  }

  const removeItem = (index: number) => {
    // 마지막 하나 남은 항목을 삭제하면 빈 항목으로 교체
    if (items.length === 1) {
      setItems([{ title: "", category: Category.STUDY, targetMinutes: "30" }])
    } else {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof PlanItemForm, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 빈 제목이 있는 항목은 필터링
      const validItems = items.filter(item => item.title.trim() !== "")
      
      const response = await fetch("/api/plans", {
        method: existingPlan ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId,
          planId: existingPlan?.id,
          items: validItems.map((item, index) => ({
            ...item,
            targetMinutes: parseInt(item.targetMinutes),
            order: index,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("계획 저장에 실패했습니다")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error saving plan:", error)
      alert("계획 저장에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 p-4 border rounded-lg">
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor={`title-${index}`}>활동명</Label>
                <Input
                  id={`title-${index}`}
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder="예: 수학 문제집 풀기"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`category-${index}`}>카테고리</Label>
                  <Select
                    value={item.category}
                    onValueChange={(value) => updateItem(index, "category", value as Category)}
                  >
                    <SelectTrigger id={`category-${index}`}>
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
                  <Label htmlFor={`minutes-${index}`}>목표 시간 (분)</Label>
                  <Input
                    id={`minutes-${index}`}
                    type="number"
                    min="10"
                    step="10"
                    value={item.targetMinutes}
                    onChange={(e) => updateItem(index, "targetMinutes", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        활동 추가
      </Button>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "저장 중..." : existingPlan ? "수정하기" : "저장하기"}
        </Button>
      </div>
    </form>
  )
}