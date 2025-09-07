import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, User, MessageCircle, Trophy } from "lucide-react"
import FeedbackDialog from "@/components/teacher/feedback-dialog"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

// Category 매핑
const categoryMap = {
  STUDY: { label: "학습", color: "bg-blue-100 text-blue-800", icon: "📚" },
  EXERCISE: { label: "운동", color: "bg-green-100 text-green-800", icon: "💪" },
  READING: { label: "독서", color: "bg-purple-100 text-purple-800", icon: "📖" },
  HOBBY: { label: "취미", color: "bg-yellow-100 text-yellow-800", icon: "🎨" },
  VOLUNTEER: { label: "봉사", color: "bg-pink-100 text-pink-800", icon: "❤️" },
  OTHER: { label: "기타", color: "bg-gray-100 text-gray-800", icon: "📝" },
}

async function getTeacherActivities(teacherId: string) {
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { schoolId: true }
  })

  if (!teacher?.schoolId) {
    return []
  }

  // 교사의 학교에 속한 학생들의 활동만 조회
  const activities = await prisma.activity.findMany({
    where: {
      student: {
        user: {
          schoolId: teacher.schoolId
        }
      }
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      feedbacks: {
        where: {
          teacherId: teacherId
        }
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: 50 // 최근 50개 활동만
  })

  return activities
}

export default async function TeacherActivitiesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const activities = await getTeacherActivities(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 활동 모니터링</h1>
          <p className="text-gray-600 mt-2">우리 학교 학생들의 최근 활동을 확인하고 피드백을 제공하세요</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>{activities.length}개 활동</span>
          </div>
        </div>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">활동이 없습니다</h3>
            <p className="text-gray-600">아직 우리 학교 학생들의 활동 기록이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const category = categoryMap[activity.category]
            const hasGivenFeedback = activity.feedbacks.length > 0
            
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {activity.student.user.name || activity.student.user.email}
                        </span>
                        <Badge variant="outline" className={category.color}>
                          {category.icon} {category.label}
                        </Badge>
                        {hasGivenFeedback && (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            피드백 완료
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(activity.date), 'M월 d일 (E)', { locale: ko })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{activity.minutes}분</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>{activity.xpEarned} XP</span>
                        </div>
                      </div>
                    </div>
                    <FeedbackDialog
                      activityId={activity.id}
                      studentId={activity.student.user.id}
                      studentName={activity.student.user.name || activity.student.user.email}
                      activityTitle={activity.title}
                      disabled={hasGivenFeedback}
                    />
                  </div>
                </CardHeader>
                {activity.description && (
                  <CardContent>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">
                      {activity.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}