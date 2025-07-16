# 07. 교사 기능 구현

## 1. 교사 전용 레이아웃

`components/layout/teacher-layout.tsx` 파일 생성:

```typescript
"use client"

import { ReactNode } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  BarChart3, 
  Users, 
  FileDown,
  LogOut,
  Menu,
  X,
  GraduationCap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

interface TeacherLayoutProps {
  children: ReactNode
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "개요", href: "/teacher/overview", icon: BarChart3 },
    { name: "학생 관리", href: "/teacher/students", icon: Users },
    { name: "데이터 내보내기", href: "/teacher/export", icon: FileDown },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link href="/teacher/overview" className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg hidden sm:block">
                  교사 대시보드
                </span>
              </Link>
            </div>

            {/* 데스크탑 네비게이션 */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium
                      transition-colors duration-200
                      ${isActive 
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* 사용자 메뉴 */}
            <div className="flex items-center space-x-4">
              {/* 프로필 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback>
                        {session?.user?.name?.[0] || "T"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        교사
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 모바일 메뉴 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-base font-medium
                      ${isActive 
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
```

## 2. 교사 개요 페이지

`app/(teacher)/overview/page.tsx` 파일 생성:

```typescript
import { requireTeacher } from "@/lib/auth/auth-utils"
import { TeacherOverviewClient } from "./overview-client"

export default async function TeacherOverviewPage() {
  const teacher = await requireTeacher()
  
  return <TeacherOverviewClient teacher={teacher} />
}
```

`app/(teacher)/overview/overview-client.tsx` 파일 생성:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsChart } from "@/components/ui/stats-chart"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Award,
  Calendar,
  Activity,
  Target,
  BookOpen
} from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface TeacherOverviewClientProps {
  teacher: any
}

export function TeacherOverviewClient({ teacher }: TeacherOverviewClientProps) {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<any>({})
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("week")

  useEffect(() => {
    fetchOverviewData()
  }, [selectedClass, selectedPeriod])

  const fetchOverviewData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ 
        classId: selectedClass,
        period: selectedPeriod 
      })
      
      const response = await fetch(`/api/teacher/overview?${params}`)
      const data = await response.json()
      
      setOverviewData(data.data)
    } catch (error) {
      console.error("Overview data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>로딩 중...</div>
  }

  const {
    totalStudents,
    activeStudents,
    totalPlans,
    completedPlans,
    totalExp,
    averageLevel,
    categoryStats,
    topStudents,
    weeklyTrends,
    classComparison
  } = overviewData

  const participationRate = totalStudents > 0 
    ? Math.round((activeStudents / totalStudents) * 100)
    : 0

  const completionRate = totalPlans > 0
    ? Math.round((completedPlans / totalPlans) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">개요</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko })}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="2-1">2-1</SelectItem>
              <SelectItem value="2-2">2-2</SelectItem>
              <SelectItem value="2-3">2-3</SelectItem>
              <SelectItem value="2-4">2-4</SelectItem>
              <SelectItem value="2-5">2-5</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">오늘</SelectItem>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
              <SelectItem value="all">전체</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 주요 통계 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">참여 학생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={activeStudents} /> / {totalStudents}
            </div>
            <Progress value={participationRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              참여율 {participationRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">계획 달성률</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={completionRate} suffix="%" />
            </div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedPlans} / {totalPlans} 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 레벨</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={averageLevel || 0} suffix=" Lv" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              총 {totalExp || 0} EXP 획득
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활동 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter 
                value={Math.floor((overviewData.totalMinutes || 0) / 60)} 
                suffix="시간" 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              학생당 평균 {Math.floor((overviewData.totalMinutes || 0) / activeStudents / 60)}시간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 활동 통계 */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatsChart 
          data={categoryStats || []} 
          type="radar" 
        />
        <StatsChart 
          data={categoryStats || []} 
          type="bar" 
        />
      </div>

      {/* 우수 학생 및 주간 트렌드 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 우수 학생 */}
        <Card>
          <CardHeader>
            <CardTitle>우수 학생 TOP 10</CardTitle>
            <CardDescription>
              {selectedPeriod === "week" ? "이번 주" : selectedPeriod === "month" ? "이번 달" : "전체"} 기준
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStudents?.map((student: any, index: number) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-6">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{student.nickname || student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Lv.{student.level} • {student.classId || "미지정"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{student.exp} EXP</p>
                    <p className="text-sm text-muted-foreground">
                      {student.completedPlans}개 완료
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 주간 트렌드 */}
        <Card>
          <CardHeader>
            <CardTitle>주간 활동 트렌드</CardTitle>
            <CardDescription>
              최근 7일간 활동 추이
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyTrends?.map((day: any) => (
                <div key={day.date} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{format(new Date(day.date), "M/d (EEE)", { locale: ko })}</span>
                    <span className="font-medium">{day.activeStudents}명</span>
                  </div>
                  <Progress 
                    value={(day.activeStudents / totalStudents) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 학급별 비교 (전체 선택 시) */}
      {selectedClass === "all" && classComparison && (
        <Card>
          <CardHeader>
            <CardTitle>학급별 비교</CardTitle>
            <CardDescription>
              각 학급의 평균 통계
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">학급</th>
                    <th className="text-center p-2">참여 학생</th>
                    <th className="text-center p-2">평균 레벨</th>
                    <th className="text-center p-2">계획 달성률</th>
                    <th className="text-center p-2">평균 활동시간</th>
                  </tr>
                </thead>
                <tbody>
                  {classComparison.map((cls: any) => (
                    <tr key={cls.classId} className="border-b">
                      <td className="p-2 font-medium">{cls.classId}</td>
                      <td className="text-center p-2">
                        {cls.activeStudents} / {cls.totalStudents}
                      </td>
                      <td className="text-center p-2">Lv.{cls.averageLevel}</td>
                      <td className="text-center p-2">{cls.completionRate}%</td>
                      <td className="text-center p-2">
                        {Math.floor(cls.averageMinutes / 60)}시간
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

## 3. 교사 API 엔드포인트

`app/api/teacher/overview/route.ts` 파일 생성:

```typescript
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"
import { ApiResponse } from "@/lib/api/response"
import { Role } from "@prisma/client"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || (session.user.role !== Role.TEACHER && session.user.role !== Role.ADMIN)) {
      return ApiResponse.forbidden()
    }

    const searchParams = req.nextUrl.searchParams
    const classId = searchParams.get("classId") || "all"
    const period = searchParams.get("period") || "week"

    // 기간 설정
    let dateFilter = {}
    const now = new Date()
    
    switch (period) {
      case "today":
        dateFilter = {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(now.setHours(23, 59, 59, 999))
        }
        break
      case "week":
        dateFilter = {
          gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
          lte: endOfWeek(new Date(), { weekStartsOn: 1 })
        }
        break
      case "month":
        dateFilter = {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date())
        }
        break
    }

    // 학생 통계
    const studentFilter = {
      role: Role.STUDENT,
      ...(classId !== "all" && { classId })
    }

    const totalStudents = await prisma.user.count({
      where: studentFilter
    })

    const activeStudents = await prisma.user.count({
      where: {
        ...studentFilter,
        plans: {
          some: period !== "all" ? {
            createdAt: dateFilter
          } : {}
        }
      }
    })

    // 계획 통계
    const planFilter = {
      user: studentFilter,
      ...(period !== "all" && { createdAt: dateFilter })
    }

    const totalPlans = await prisma.plan.count({
      where: planFilter
    })

    const completedPlans = await prisma.plan.count({
      where: {
        ...planFilter,
        completed: true
      }
    })

    // 경험치 및 레벨 통계
    const expStats = await prisma.user.aggregate({
      where: studentFilter,
      _avg: {
        level: true,
        totalExp: true
      },
      _sum: {
        totalExp: true
      }
    })

    // 카테고리별 통계
    const categoryStats = await prisma.plan.groupBy({
      by: ["category"],
      where: {
        ...planFilter,
        completed: true
      },
      _sum: {
        actualTime: true
      },
      _count: true
    })

    const formattedCategoryStats = categoryStats.map(stat => ({
      category: stat.category,
      label: {
        STUDY: "학습",
        EXERCISE: "운동",
        READING: "독서",
        VOLUNTEER: "봉사",
        HOBBY: "취미",
        SOCIAL: "사회활동"
      }[stat.category],
      time: stat._sum.actualTime || 0,
      count: stat._count
    }))

    // 총 활동 시간
    const totalMinutes = await prisma.plan.aggregate({
      where: {
        ...planFilter,
        completed: true
      },
      _sum: {
        actualTime: true
      }
    })

    // 우수 학생 TOP 10
    const topStudentsData = await prisma.plan.groupBy({
      by: ["userId"],
      where: {
        ...planFilter,
        completed: true
      },
      _sum: {
        exp: true
      },
      _count: true,
      orderBy: {
        _sum: {
          exp: "desc"
        }
      },
      take: 10
    })

    const topStudentIds = topStudentsData.map(s => s.userId)
    const topStudentUsers = await prisma.user.findMany({
      where: { id: { in: topStudentIds } },
      select: {
        id: true,
        name: true,
        nickname: true,
        level: true,
        classId: true
      }
    })

    const topStudents = topStudentsData.map(data => {
      const user = topStudentUsers.find(u => u.id === data.userId)
      return {
        ...user,
        exp: data._sum.exp || 0,
        completedPlans: data._count
      }
    })

    // 주간 트렌드 (최근 7일)
    const weeklyTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayActiveStudents = await prisma.user.count({
        where: {
          ...studentFilter,
          plans: {
            some: {
              createdAt: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          }
        }
      })
      
      weeklyTrends.push({
        date: dayStart.toISOString(),
        activeStudents: dayActiveStudents
      })
    }

    // 학급별 비교 (전체 선택 시)
    let classComparison = []
    if (classId === "all") {
      const classes = ["2-1", "2-2", "2-3", "2-4", "2-5"]
      
      for (const cls of classes) {
        const classStudents = await prisma.user.count({
          where: { role: Role.STUDENT, classId: cls }
        })
        
        const classActiveStudents = await prisma.user.count({
          where: {
            role: Role.STUDENT,
            classId: cls,
            plans: {
              some: period !== "all" ? {
                createdAt: dateFilter
              } : {}
            }
          }
        })
        
        const classStats = await prisma.user.aggregate({
          where: { role: Role.STUDENT, classId: cls },
          _avg: { level: true }
        })
        
        const classPlans = await prisma.plan.aggregate({
          where: {
            user: { role: Role.STUDENT, classId: cls },
            ...(period !== "all" && { createdAt: dateFilter })
          },
          _count: true
        })
        
        const classCompletedPlans = await