import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ActivityForm } from "@/components/activities/activity-form"
import { ActivityList } from "@/components/activities/activity-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ActivitiesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!studentProfile) {
    redirect("/dashboard")
  }

  // 오늘의 계획 조회
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayPlan = await prisma.plan.findFirst({
    where: {
      studentId: studentProfile.id,
      date: today,
    },
    include: {
      items: {
        orderBy: { order: "asc" },
      },
    },
  })

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">활동 기록</h1>
        <p className="mt-2 text-gray-600">
          오늘 수행한 활동을 기록하고 경험치를 획득하세요
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 왼쪽: 활동 기록 폼 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>새로운 활동 기록</CardTitle>
              <CardDescription>
                활동 내용과 소요 시간을 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityForm 
                studentProfileId={studentProfile.id}
                todayPlan={todayPlan}
                currentStreak={studentProfile.currentStreak}
              />
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 최근 활동 목록 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>최근 활동 내역</CardTitle>
              <CardDescription>
                최근 20개의 활동 기록입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityList activities={studentProfile.activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}