import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { AvatarDisplay } from "@/components/avatar/avatar-display"
import { BarChart, Calendar, Trophy, TrendingUp } from "lucide-react"

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
      },
      plans: {
        include: { items: true },
        orderBy: { date: "desc" },
      },
    },
  })

  if (!studentProfile) {
    redirect("/dashboard")
  }

  // 카테고리별 활동 시간 집계
  const categoryStats = studentProfile.activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + activity.minutes
    return acc
  }, {} as Record<string, number>)

  // 최근 7일간의 활동 통계
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentActivities = studentProfile.activities.filter(
    activity => activity.createdAt >= sevenDaysAgo
  )

  const dailyStats = recentActivities.reduce((acc, activity) => {
    const date = activity.createdAt.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + activity.xpEarned
    return acc
  }, {} as Record<string, number>)

  // 계획 달성률 계산
  const completedPlans = studentProfile.plans.filter(plan => 
    plan.items.every(item => item.isCompleted)
  ).length
  const totalPlans = studentProfile.plans.length
  const planCompletionRate = totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">통계</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 활동 시간</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentProfile.totalMinutes}분</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(studentProfile.totalMinutes / 60)}시간 {studentProfile.totalMinutes % 60}분
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 경험치</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentProfile.totalXP} XP</div>
            <p className="text-xs text-muted-foreground">
              레벨 {studentProfile.level}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">계획 달성률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planCompletionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {completedPlans}/{totalPlans} 완료
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>아바타 능력치</CardTitle>
            <CardDescription>활동을 통해 성장한 능력치</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarDisplay 
              level={studentProfile.level}
              totalXP={studentProfile.totalXP}
              xpForNextLevel={studentProfile.xpForNextLevel}
              avatarImageUrl={studentProfile.avatarImageUrl}
              stats={{
                strength: studentProfile.strength,
                intelligence: studentProfile.intelligence,
                dexterity: studentProfile.dexterity,
                charisma: studentProfile.charisma,
                vitality: studentProfile.vitality,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>카테고리별 활동 시간</CardTitle>
            <CardDescription>각 카테고리에 투자한 시간</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categoryStats).map(([category, minutes]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{category}</span>
                  <span className="text-muted-foreground">{minutes}분</span>
                </div>
                <Progress 
                  value={(minutes / studentProfile.totalMinutes) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>최근 7일 활동</CardTitle>
          <CardDescription>일별 획득 경험치</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(dailyStats)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 7)
              .map(([date, xp]) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-sm">{new Date(date).toLocaleDateString('ko-KR')}</span>
                  <span className="font-medium">{xp} XP</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}