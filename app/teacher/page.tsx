import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, Award } from "lucide-react"
import Link from "next/link"

export default async function TeacherDashboard() {
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
            교사 대시보드를 이용하기 위해 먼저 학교 정보를 설정해주세요.
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                학교를 설정하면 같은 학교 학생들의 학습 현황을 확인할 수 있습니다.
              </div>
              <Link href="/dashboard/profile" className="block w-full">
                <div className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center">
                  학교 설정하기
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // 같은 학교의 학생 통계
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
            }
          }
        }
      }
    }
  })
  
  const totalStudents = students.length
  const activeStudents = students.filter(s => 
    s.studentProfile?.activities && s.studentProfile.activities.length > 0
  ).length
  
  const totalActivities = students.reduce((sum, s) => 
    sum + (s.studentProfile?.activities?.length || 0), 0
  )
  
  const totalXP = students.reduce((sum, s) => 
    sum + (s.studentProfile?.totalXP || 0), 0
  )
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {teacher.school.name} 대시보드
        </h2>
        <p className="text-muted-foreground">
          학생들의 학습 현황을 한눈에 확인하세요
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              전체 학생
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}명</div>
            <p className="text-xs text-muted-foreground">
              등록된 학생 수
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              활동 학생
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}명</div>
            <p className="text-xs text-muted-foreground">
              최근 30일 내 활동
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              총 활동
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}개</div>
            <p className="text-xs text-muted-foreground">
              최근 30일간 기록
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              총 경험치
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalXP.toLocaleString()} XP</div>
            <p className="text-xs text-muted-foreground">
              학생들이 획득한 경험치
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동 학생</CardTitle>
            <CardDescription>오늘 활동을 기록한 학생들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students
                .filter(s => {
                  const today = new Date().toDateString()
                  return s.studentProfile?.activities?.some(a => 
                    a.createdAt.toDateString() === today
                  )
                })
                .slice(0, 5)
                .map(student => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Level {student.studentProfile?.level || 1}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {student.studentProfile?.activities?.filter(a => 
                        a.createdAt.toDateString() === new Date().toDateString()
                      ).length || 0} 활동
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>상위 학생</CardTitle>
            <CardDescription>경험치 기준 상위 5명</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students
                .sort((a, b) => (b.studentProfile?.totalXP || 0) - (a.studentProfile?.totalXP || 0))
                .slice(0, 5)
                .map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{index + 1}</span>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Level {student.studentProfile?.level || 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {student.studentProfile?.totalXP || 0} XP
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-4">
        <Link href="/teacher/students">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>학생 관리</CardTitle>
              <CardDescription>
                학생별 상세 활동 기록과 통계를 확인하세요
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/teacher/reports">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>보고서 생성</CardTitle>
              <CardDescription>
                학습 보고서를 생성하고 내보내기 할 수 있습니다
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}