import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PlanForm } from "@/components/plan/plan-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PlanPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!studentProfile) {
    redirect("/dashboard")
  }

  // 오늘의 계획 조회
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const existingPlan = await prisma.plan.findFirst({
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
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">일일 계획 작성</h1>
        <p className="mt-2 text-gray-600">
          오늘 하루 동안 수행할 활동들을 계획해보세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </CardTitle>
          <CardDescription>
            각 활동별로 목표 시간을 설정하고, 카테고리를 선택해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm 
            studentProfileId={studentProfile.id}
            existingPlan={existingPlan}
          />
        </CardContent>
      </Card>
    </div>
  )
}