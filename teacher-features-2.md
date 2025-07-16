# 07. 교사 기능 구현 (계속)

## 4. 학생 관리 페이지

`app/(teacher)/students/page.tsx` 파일 생성:

```typescript
import { requireTeacher } from "@/lib/auth/auth-utils"
import { StudentsClient } from "./students-client"

export default async function StudentsPage() {
  const teacher = await requireTeacher()
  
  return <StudentsClient teacher={teacher} />
}
```

`app/(teacher)/students/students-client.tsx` 파일 생성:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  User, 
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Award,
  ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { formatTime } from "@/lib/utils/date"

interface StudentsClientProps {
  teacher: any
}

export function StudentsClient({ teacher }: StudentsClientProps) {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("level")

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterAndSortStudents()
  }, [students, searchTerm, selectedClass, sortBy])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/teacher/students")
      const data = await response.json()
      setStudents(data.data || [])
    } catch (error) {
      console.error("Students fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortStudents = () => {
    let filtered = [...students]
    
    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // 학급 필터
    if (selectedClass !== "all") {
      filtered = filtered.filter(student => student.classId === selectedClass)
    }
    
    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "level":
          return b.level - a.level
        case "exp":
          return b.totalExp - a.totalExp
        case "streak":
          return (b.stats?.currentStreak || 0) - (a.stats?.currentStreak || 0)
        case "activity":
          return (b.stats?.totalMinutes || 0) - (a.stats?.totalMinutes || 0)
        case "name":
          return (a.nickname || a.name || "").localeCompare(b.nickname || b.name || "")
        default:
          return 0
      }
    })
    
    setFilteredStudents(filtered)
  }

  const fetchStudentDetails = async (studentId: string) => {
    try {
      const response = await fetch(`/api/teacher/students/${studentId}`)
      const data = await response.json()
      setSelectedStudent(data.data)
      setDetailsOpen(true)
    } catch (error) {
      console.error("Student details fetch error:", error)
    }
  }

  const getTotalMinutes = (stats: any) => {
    if (!stats) return 0
    return stats.studyTime + stats.exerciseTime + stats.readingTime + 
           stats.volunteerTime + stats.hobbyTime + stats.socialTime
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">학생 관리</h1>
        <p className="text-muted-foreground">
          학생들의 상세 활동 내역을 확인하세요
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>학생 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="이름, 닉네임, 이메일로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="학급 선택" />
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
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="level">레벨 순</SelectItem>
                <SelectItem value="exp">경험치 순</SelectItem>
                <SelectItem value="streak">연속 일수 순</SelectItem>
                <SelectItem value="activity">활동 시간 순</SelectItem>
                <SelectItem value="name">이름 순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 학생 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
          <CardDescription>
            총 {filteredStudents.length}명의 학생
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              검색 결과가 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => fetchStudentDetails(student.id)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={student.image} />
                      <AvatarFallback>
                        {student.nickname?.[0] || student.name?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {student.nickname || student.name}
                        </p>
                        <Badge variant="secondary">
                          Lv.{student.level}
                        </Badge>
                        {student.classId && (
                          <Badge variant="outline">
                            {student.classId}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">경험치</p>
                      <p className="font-medium">{student.totalExp}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">연속</p>
                      <p className="font-medium">{student.stats?.currentStreak || 0}일</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">활동</p>
                      <p className="font-medium">
                        {formatTime(getTotalMinutes(student.stats))}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 학생 상세 정보 모달 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>학생 상세 정보</DialogTitle>
            <DialogDescription>
              {selectedStudent?.nickname || selectedStudent?.name}님의 활동 내역
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.image} />
                  <AvatarFallback className="text-xl">
                    {selectedStudent.nickname?.[0] || selectedStudent.name?.[0] || "S"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {selectedStudent.nickname || selectedStudent.name}
                  </h3>
                  <p className="text-muted-foreground">{selectedStudent.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge>Lv.{selectedStudent.level}</Badge>
                    {selectedStudent.classId && (
                      <Badge variant="outline">{selectedStudent.classId}</Badge>
                    )}
                    <Badge variant="secondary">
                      {selectedStudent.totalExp} EXP
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 통계 탭 */}
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">개요</TabsTrigger>
                  <TabsTrigger value="activities">활동 내역</TabsTrigger>
                  <TabsTrigger value="achievements">업적</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* 전체 통계 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">활동 통계</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">총 활동 시간</span>
                            <span className="font-medium">
                              {formatTime(getTotalMinutes(selectedStudent.stats))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">완료한 계획</span>
                            <span className="font-medium">
                              {selectedStudent.completedPlans || 0}개
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">현재 연속 일수</span>
                            <span className="font-medium">
                              {selectedStudent.stats?.currentStreak || 0}일
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">최고 연속 일수</span>
                            <span className="font-medium">
                              {selectedStudent.stats?.bestStreak || 0}일
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">카테고리별 시간</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">📚 학습</span>
                            <span className="font-medium">
                              {formatTime(selectedStudent.stats?.studyTime || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">💪 운동</span>
                            <span className="font-medium">
                              {formatTime(selectedStudent.stats?.exerciseTime || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">📖 독서</span>
                            <span className="font-medium">
                              {formatTime(selectedStudent.stats?.readingTime || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">🤝 봉사</span>
                            <span className="font-medium">
                              {formatTime(selectedStudent.stats?.volunteerTime || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">🎨 취미</span>
                            <span className="font-medium">
                              {formatTime(selectedStudent.stats?.hobbyTime || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">👥 사회활동</span>
                            <span className="font-medium">
                              {formatTime(selectedStudent.stats?.socialTime || 0)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 주간 리포트 */}
                  {selectedStudent.weeklyReport && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">최근 주간 리포트</CardTitle>
                        <CardDescription>
                          AI가 생성한 활동 요약
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedStudent.weeklyReport.summary}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                  {/* 최근 활동 목록 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">최근 활동</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedStudent.recentPlans?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          아직 활동 내역이 없습니다
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedStudent.recentPlans?.map((plan: any) => (
                            <div
                              key={plan.id}
                              className="flex items-center justify-between py-2 border-b last:border-0"
                            >
                              <div>
                                <p className="font-medium">{plan.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(plan.completedAt), "M월 d일 HH:mm")}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="secondary">
                                  +{plan.exp} EXP
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                  {plan.actualTime}분
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                  {/* 업적 목록 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">획득한 업적</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedStudent.achievements?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          아직 획득한 업적이 없습니다
                        </p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                          {selectedStudent.achievements?.map((achievement: any) => (
                            <div
                              key={achievement.id}
                              className="flex items-center space-x-3 p-3 border rounded-lg"
                            >
                              <div className="text-2xl">{achievement.icon}</div>
                              <div>
                                <p className="font-medium">{achievement.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {achievement.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

## 5. 교사용 학생 API

`app/api/teacher/students/route.ts` 파일 생성:

```typescript
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"
import { ApiResponse } from "@/lib/api/response"
import { Role } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || (session.user.role !== Role.TEACHER && session.user.role !== Role.ADMIN)) {
      return ApiResponse.forbidden()
    }

    const students = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      include: {
        stats: true,
        _count: {
          select: {
            plans: {
              where: { completed: true }
            }
          }
        }
      },
      orderBy: { level: "desc" }
    })

    const formattedStudents = students.map(student => ({
      ...student,
      completedPlans: student._count.plans,
      stats: {
        ...student.stats,
        totalMinutes: student.stats 
          ? student.stats.studyTime + student.stats.exerciseTime + 
            student.stats.readingTime + student.stats.volunteerTime + 
            student.stats.hobbyTime + student.stats.socialTime
          : 0
      }
    }))

    return ApiResponse.success(formattedStudents)
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}
```

`app/api/teacher/students/[id]/route.ts` 파일 생성:

```typescript
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"
import { ApiResponse } from "@/lib/api/response"
import { Role } from "@prisma/client"
import { subDays } from "date-fns"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || (session.user.role !== Role.TEACHER && session.user.role !== Role.ADMIN)) {
      return ApiResponse.forbidden()
    }

    const student = await prisma.user.findUnique({
      where: { 
        id: params.id,
        role: Role.STUDENT
      },
      include: {
        stats: true,
        achievements: {
          orderBy: { unlockedAt: "desc" }
        }
      }
    })

    if (!student) {
      return ApiResponse.notFound("학생을 찾을 수 없습니다")
    }

    // 최근 완료한 계획
    const recentPlans = await prisma.plan.findMany({
      where: {
        userId: params.id,
        completed: true
      },
      orderBy: { completedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        category: true,
        exp: true,
        actualTime: true,
        completedAt: true
      }
    })

    // 완료한 계획 수
    const completedPlans = await prisma.plan.count({
      where: {
        userId: params.id,
        completed: true
      }
    })

    // 최근 주간 리포트
    const weeklyReport = await prisma.weeklyReport.findFirst({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" }
    })

    return ApiResponse.success({
      ...student,
      completedPlans,
      recentPlans,
      weeklyReport
    })
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}
```

## 다음 단계
교사 기능 구현이 진행 중입니다. 다음은 데이터 내보내기 기능과 AI 통합을 구현해야 합니다.