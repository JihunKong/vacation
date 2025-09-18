import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileDown, TrendingUp, Award, Clock, BookOpen } from "lucide-react"
import Link from "next/link"

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)
  
  // 교사의 학교 정보 가져오기
  const teacher = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: {
      school: true
    }
  })
  
  if (!teacher?.school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">학교 설정이 필요합니다</h2>
          <p className="text-muted-foreground mt-2">
            학생 관리를 위해 먼저 학교 정보를 설정해주세요.
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                학교를 설정하면 같은 학교 학생들의 학습 현황을 확인할 수 있습니다.
              </div>
              <Button onClick={() => window.location.href = '/dashboard/profile'} className="w-full">
                학교 설정하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // 같은 학교의 모든 학생 정보 가져오기
  const students = await prisma.user.findMany({
    where: {
      schoolId: teacher.schoolId,
      role: "STUDENT"
    },
    include: {
      studentProfile: {
        include: {
          activities: {
            where: {
              createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30))
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          badges: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">학생 관리</h2>
          <p className="text-muted-foreground">
            {teacher.school.name} 학생들의 학습 현황
          </p>
        </div>
        <Button>
          <FileDown className="mr-2 h-4 w-4" />
          전체 데이터 내보내기
        </Button>
      </div>
      
      <div className="grid gap-4">
        {students.map(student => {
          const profile = student.studentProfile
          const recentActivities = profile?.activities || []
          const totalMinutes = recentActivities.reduce((sum, a) => sum + a.minutes, 0)
          const avgMinutesPerDay = recentActivities.length > 0 
            ? Math.round(totalMinutes / 30) 
            : 0
          
          return (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{student.name}</CardTitle>
                    <CardDescription>{student.email}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">Level {profile?.level || 1}</Badge>
                    <Badge variant="secondary">{profile?.totalXP || 0} XP</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">총 활동</p>
                      <p className="text-2xl font-bold">{recentActivities.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">총 학습 시간</p>
                      <p className="text-2xl font-bold">{totalMinutes}분</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">일일 평균</p>
                      <p className="text-2xl font-bold">{avgMinutesPerDay}분</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">연속 출석</p>
                      <p className="text-2xl font-bold">{profile?.currentStreak || 0}일</p>
                    </div>
                  </div>
                </div>
                
                {recentActivities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">최근 활동</p>
                    <div className="flex gap-2 flex-wrap">
                      {recentActivities.slice(0, 5).map(activity => (
                        <Badge key={activity.id} variant="secondary">
                          {activity.title} ({activity.minutes}분)
                        </Badge>
                      ))}
                      {recentActivities.length > 5 && (
                        <Badge variant="outline">+{recentActivities.length - 5} more</Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Link href={`/teacher/students/${student.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      상세 보기
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    보고서 생성
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {students.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                아직 등록된 학생이 없습니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}