import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Download, TrendingUp, Target, Clock, Award } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export default async function StudentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  // 교사 권한 및 학교 확인
  const teacher = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { role: true, schoolId: true }
  })
  
  if (teacher?.role !== "TEACHER") {
    redirect("/dashboard")
  }
  
  // 학생 정보 가져오기 (같은 학교인지 확인)
  const student = await prisma.user.findFirst({
    where: {
      id: id,
      schoolId: teacher.schoolId,
      role: "STUDENT"
    },
    include: {
      school: true,
      studentProfile: {
        include: {
          activities: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          badges: true,
          plans: {
            include: {
              items: true
            },
            orderBy: {
              date: 'desc'
            },
            take: 7
          }
        }
      }
    }
  })
  
  if (!student) {
    notFound()
  }
  
  const profile = student.studentProfile!
  
  // 카테고리별 통계 계산
  const categoryStats = profile.activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = { count: 0, minutes: 0, xp: 0 }
    }
    acc[activity.category].count++
    acc[activity.category].minutes += activity.minutes
    acc[activity.category].xp += activity.xpEarned
    return acc
  }, {} as Record<string, { count: number; minutes: number; xp: number }>)
  
  // 주간 활동 패턴 분석
  const weeklyPattern = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toDateString()
    const dayActivities = profile.activities.filter(a => 
      a.createdAt.toDateString() === dateStr
    )
    return {
      date,
      count: dayActivities.length,
      minutes: dayActivities.reduce((sum, a) => sum + a.minutes, 0)
    }
  }).reverse()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            학생 목록으로
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{student.name}</h2>
          <p className="text-muted-foreground">{student.email}</p>
          <Badge variant="outline" className="mt-2">{student.school?.name}</Badge>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          보고서 다운로드
        </Button>
      </div>
      
      {/* 주요 지표 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">레벨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {profile.level}</div>
            <Progress 
              value={(profile.experience / profile.xpForNextLevel) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {profile.experience} / {profile.xpForNextLevel} XP
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 경험치</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.totalXP} XP</div>
            <p className="text-xs text-muted-foreground">
              누적 경험치
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 학습 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.totalMinutes}분</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(profile.totalMinutes / 60)}시간 {profile.totalMinutes % 60}분
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">연속 출석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.currentStreak}일</div>
            <p className="text-xs text-muted-foreground">
              최고 기록: {profile.longestStreak}일
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* 능력치 */}
      <Card>
        <CardHeader>
          <CardTitle>능력치</CardTitle>
          <CardDescription>활동 카테고리별 성장 상태</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <p className="text-sm font-medium">STR (힘)</p>
              <p className="text-2xl font-bold">{profile.strength}</p>
              <p className="text-xs text-muted-foreground">운동</p>
            </div>
            <div>
              <p className="text-sm font-medium">INT (지능)</p>
              <p className="text-2xl font-bold">{profile.intelligence}</p>
              <p className="text-xs text-muted-foreground">학습, 독서</p>
            </div>
            <div>
              <p className="text-sm font-medium">DEX (민첩)</p>
              <p className="text-2xl font-bold">{profile.dexterity}</p>
              <p className="text-xs text-muted-foreground">취미</p>
            </div>
            <div>
              <p className="text-sm font-medium">CHA (매력)</p>
              <p className="text-2xl font-bold">{profile.charisma}</p>
              <p className="text-xs text-muted-foreground">봉사</p>
            </div>
            <div>
              <p className="text-sm font-medium">VIT (활력)</p>
              <p className="text-2xl font-bold">{profile.vitality}</p>
              <p className="text-xs text-muted-foreground">기타</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 카테고리별 활동 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 활동</CardTitle>
          <CardDescription>전체 기간 활동 분석</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.count}개 활동
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>총 시간</span>
                    <span className="font-medium">{stats.minutes}분</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>획득 XP</span>
                    <span className="font-medium">{stats.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 최근 7일 활동 패턴 */}
      <Card>
        <CardHeader>
          <CardTitle>주간 활동 패턴</CardTitle>
          <CardDescription>최근 7일간 활동 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weeklyPattern.map(day => (
              <div key={day.date.toISOString()} className="flex items-center gap-4">
                <span className="text-sm w-20">
                  {format(day.date, 'M/d (EEE)', { locale: ko })}
                </span>
                <div className="flex-1">
                  <Progress 
                    value={day.minutes > 0 ? Math.min((day.minutes / 120) * 100, 100) : 0} 
                  />
                </div>
                <span className="text-sm font-medium w-20 text-right">
                  {day.minutes}분
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 최근 활동 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>최근 10개 활동 기록</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.activities.slice(0, 10).map(activity => (
              <div key={activity.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(activity.createdAt, 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activity.category}</Badge>
                  <Badge variant="secondary">{activity.minutes}분</Badge>
                  <Badge>{activity.xpEarned} XP</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}