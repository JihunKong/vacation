import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import TeacherActivitiesClient from "./client"

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

  return activities.map(activity => ({
    ...activity,
    date: activity.date.toISOString()
  }))
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
        <TeacherActivitiesClient activities={activities} />
      )}
    </div>
  )
}