# 06. 학생 기능 구현

## 1. 대시보드 페이지

`app/(main)/dashboard/page.tsx` 파일 생성:

```typescript
import { requireAuth } from "@/lib/auth/auth-utils"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const user = await requireAuth()
  
  return <DashboardClient user={user} />
}
```

`app/(main)/dashboard/dashboard-client.tsx` 파일 생성:

```typescript
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/ui/category-badge"
import { ExpProgress } from "@/components/ui/exp-progress"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { StatsChart } from "@/components/ui/stats-chart"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { 
  Calendar, 
  Trophy, 
  Flame, 
  Clock,
  TrendingUp,
  Target,
  CheckCircle2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface DashboardClientProps {
  user: any
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [todayPlans, setTodayPlans] = useState<any[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 통계 가져오기
      const statsRes = await fetch("/api/stats?period=week")
      const statsData = await statsRes.json()
      
      // 오늘 계획 가져오기
      const today = new Date().toISOString().split('T')[0]
      const plansRes = await fetch(`/api/plans?date=${today}`)
      const plansData = await plansRes.json()
      
      setStats(statsData.data)
      setTodayPlans(plansData.data || [])
      
      // 주간 진행률 계산
      const completedPlans = plansData.data?.filter((p: any) => p.completed).length || 0
      const totalPlans = plansData.data?.length || 0
      setWeeklyProgress(totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0)
      
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  const categoryData = [
    { category: "STUDY", label: "학습", time: stats?.overall?.studyTime || 0 },
    { category: "EXERCISE", label: "운동", time: stats?.overall?.exerciseTime || 0 },
    { category: "READING", label: "독서", time: stats?.overall?.readingTime || 0 },
    { category: "VOLUNTEER", label: "봉사", time: stats?.overall?.volunteerTime || 0 },
    { category: "HOBBY", label: "취미", time: stats?.overall?.hobbyTime || 0 },
    { category: "SOCIAL", label: "사회활동", time: stats?.overall?.socialTime || 0 },
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          안녕하세요, {user.nickname || user.name}님! 👋
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko })}
        </p>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 레벨</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={user.level} suffix=" Lv" />
            </div>
            <ExpProgress totalExp={user.totalExp} showLabel={false} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연속 달성</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={stats?.overall?.currentStreak || 0} suffix="일" />
            </div>
            <p className="text-xs text-muted-foreground">
              최고 기록: {stats?.overall?.bestStreak || 0}일
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 진행률</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(weeklyProgress)}%</div>
            <Progress value={weeklyProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 활동 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter 
                value={Math.floor((stats?.overall?.totalTime || 0) / 60)} 
                suffix="시간" 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              이번 주: {Math.floor((stats?.period?.totalTime || 0) / 60)}시간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 오늘의 계획 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>오늘의 계획</CardTitle>
            <CardDescription>
              {todayPlans.length}개의 계획이 있습니다
            </CardDescription>
          </div>
          <Button onClick={() => router.push("/planner")}>
            계획 추가
          </Button>
        </CardHeader>
        <CardContent>
          {todayPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4" />
              <p>아직 오늘의 계획이 없습니다</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push("/planner")}
              >
                계획 만들기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <CategoryBadge category={plan.category} />
                    <div>
                      <p className="font-medium">{plan.title}</p>
                      <p className="text-sm text-muted-foreground">
                        목표: {plan.targetTime}분
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {plan.completed ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        완료
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/planner?plan=${plan.id}`)}
                      >
                        시작하기
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 카테고리별 통계 */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatsChart data={categoryData} type="radar" />
        <StatsChart data={categoryData} type="bar" />
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>
            최근에 완료한 계획들입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recent?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              아직 완료한 활동이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {stats?.recent?.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-3">
                    <CategoryBadge category={activity.category} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.completedAt), "M월 d일 HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">+{activity.exp} EXP</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.actualTime}분
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

## 2. 플래너 페이지

`app/(main)/planner/page.tsx` 파일 생성:

```typescript
import { requireAuth } from "@/lib/auth/auth-utils"
import { PlannerClient } from "./planner-client"

export default async function PlannerPage() {
  const user = await requireAuth()
  
  return <PlannerClient user={user} />
}
```

`app/(main)/planner/planner-client.tsx` 파일 생성:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CategoryBadge } from "@/components/ui/category-badge"
import { toast } from "@/components/ui/use-toast"
import { Category } from "@prisma/client"
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { ko } from "date-fns/locale"
import { Plus, Clock, CheckCircle2, Edit2, Trash2 } from "lucide-react"

interface PlannerClientProps {
  user: any
}

export function PlannerClient({ user }: PlannerClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [plans, setPlans] = useState<any[]>([])
  const [weekPlans, setWeekPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "STUDY" as Category,
    targetTime: 30
  })

  useEffect(() => {
    fetchPlans()
  }, [selectedDate])

  const fetchPlans = async () => {
    try {
      // 선택된 날짜의 계획
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const dayRes = await fetch(`/api/plans?date=${dateStr}`)
      const dayData = await dayRes.json()
      
      // 주간 계획
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
      const weekRes = await fetch(
        `/api/plans?startDate=${format(weekStart, "yyyy-MM-dd")}&endDate=${format(weekEnd, "yyyy-MM-dd")}`
      )
      const weekData = await weekRes.json()
      
      setPlans(dayData.data || [])
      setWeekPlans(weekData.data || [])
    } catch (error) {
      console.error("Plans fetch error:", error)
      toast({
        title: "계획을 불러오는데 실패했습니다",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "제목을 입력해주세요",
        variant: "destructive"
      })
      return
    }

    try {
      const url = editingPlan 
        ? `/api/plans/${editingPlan.id}`
        : "/api/plans"
      
      const method = editingPlan ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error("계획 저장 실패")
      }

      toast({
        title: editingPlan ? "계획이 수정되었습니다" : "계획이 추가되었습니다"
      })

      setDialogOpen(false)
      resetForm()
      fetchPlans()
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        variant: "destructive"
      })
    }
  }

  const handleComplete = async (planId: string, actualTime: number) => {
    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: true,
          actualTime
        })
      })

      if (!response.ok) {
        throw new Error("완료 처리 실패")
      }

      toast({
        title: "계획을 완료했습니다! 🎉",
        description: "경험치를 획득했습니다"
      })

      fetchPlans()
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (planId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("삭제 실패")
      }

      toast({
        title: "계획이 삭제되었습니다"
      })

      fetchPlans()
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "STUDY",
      targetTime: 30
    })
    setEditingPlan(null)
  }

  const openEditDialog = (plan: any) => {
    setEditingPlan(plan)
    setFormData({
      title: plan.title,
      description: plan.description || "",
      category: plan.category,
      targetTime: plan.targetTime
    })
    setDialogOpen(true)
  }

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 })
  })

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">플래너</h1>
          <p className="text-muted-foreground">
            계획을 세우고 목표를 달성해보세요
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          계획 추가
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 캘린더 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>날짜 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ko}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* 선택된 날짜의 계획 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {format(selectedDate, "M월 d일 EEEE", { locale: ko })}의 계획
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">로딩 중...</p>
            ) : plans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  아직 계획이 없습니다
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                >
                  첫 계획 만들기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CategoryBadge category={plan.category} />
                          <h3 className="font-medium">{plan.title}</h3>
                        </div>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground">
                            {plan.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            목표: {plan.targetTime}분
                          </span>
                          {plan.completed && (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              완료: {plan.actualTime}분
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!plan.completed && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(plan)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(plan.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                const time = prompt("실제 소요 시간(분)을 입력하세요:", plan.targetTime.toString())
                                if (time) {
                                  handleComplete(plan.id, parseInt(time))
                                }
                              }}
                            >
                              완료
                            </Button>
                          </>
                        )}
                        {plan.completed && (
                          <Badge variant="default" className="bg-green-500">
                            +{plan.exp} EXP
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 주간 뷰 */}
      <Card>
        <CardHeader>
          <CardTitle>이번 주 계획</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayPlans = weekPlans.filter(
                p => format(new Date(p.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
              )
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
              const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    border rounded-lg p-2 cursor-pointer transition-colors
                    ${isToday ? "border-primary" : ""}
                    ${isSelected ? "bg-secondary" : "hover:bg-secondary/50"}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-center mb-2">
                    <p className="text-xs text-muted-foreground">
                      {format(day, "EEE", { locale: ko })}
                    </p>
                    <p className="font-medium">{format(day, "d")}</p>
                  </div>
                  
                  <div className="space-y-1">
                    {dayPlans.length === 0 ? (
                      <p className="text-xs text-center text-muted-foreground">-</p>
                    ) : (
                      dayPlans.slice(0, 3).map((plan) => (
                        <div
                          key={plan.id}
                          className={`
                            text-xs p-1 rounded
                            ${plan.completed ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}
                          `}
                        >
                          {plan.title.length > 8 ? plan.title.slice(0, 8) + "..." : plan.title}
                        </div>
                      ))
                    )}
                    {dayPlans.length > 3 && (
                      <p className="text-xs text-center text-muted-foreground">
                        +{dayPlans.length - 3}개
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 계획 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "계획 수정" : "새 계획 추가"}
            </DialogTitle>
            <DialogDescription>
              {format(selectedDate, "yyyy년 M월 d일")}의 계획을 만들어보세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 수학 문제집 3장"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDY">📚 학습</SelectItem>
                  <SelectItem value="EXERCISE">💪 운동</SelectItem>
                  <SelectItem value="READING">📖 독서</SelectItem>
                  <SelectItem value="VOLUNTEER">🤝 봉사</SelectItem>
                  <SelectItem value="HOBBY">🎨 취미</SelectItem>
                  <SelectItem value="SOCIAL">👥 사회활동</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetTime">목표 시간 (분)</Label>
              <Input
                id="targetTime"
                type="number"
                min="5"
                max="480"
                value={formData.targetTime}
                onChange={(e) => setFormData({ ...formData, targetTime: parseInt(e.target.value) || 30 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="계획에 대한 자세한 설명을 적어보세요"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false)
              resetForm()
            }}>
              취소
            </Button>
            <Button onClick={handleSubmit}>
              {editingPlan ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}