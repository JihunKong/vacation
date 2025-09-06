import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AvatarDisplay } from "@/components/avatar/avatar-display"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { TodayPlan } from "@/components/dashboard/today-plan"
import { AIMessage } from "@/components/dashboard/ai-message"
import AchievementTracker from "@/components/features/AchievementTracker"
import { SchoolSetupBanner } from "@/components/school/school-setup-banner"
import { calculateLevel } from "@/lib/game/stats"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // 학생 프로필 조회 또는 생성
  let studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      badges: true,
    },
  })

  if (!studentProfile) {
    studentProfile = await prisma.studentProfile.create({
      data: { userId: session.user.id },
      include: {
        activities: true,
        badges: true,
      },
    })
  }

  // 오늘 계획 조회
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

  // 레벨 계산
  const { level, currentXP, requiredXP } = calculateLevel(studentProfile.totalXP)
  
  // 실제 활동 일수 계산 (중복 없는 날짜 수)
  const uniqueActivityDates = await prisma.activity.groupBy({
    by: ['date'],
    where: {
      studentId: studentProfile.id
    },
    _count: true
  })
  const actualTotalDays = uniqueActivityDates.length

  // 최근 활동 제목 (AI 메시지용)
  const recentActivity = studentProfile.activities[0]?.title

  // AI 메시지용 학생 데이터
  const studentData = {
    level,
    totalXP: studentProfile.totalXP,
    currentStreak: studentProfile.currentStreak,
    recentActivity,
    strength: studentProfile.strength,
    intelligence: studentProfile.intelligence,
    dexterity: studentProfile.dexterity,
    charisma: studentProfile.charisma,
    vitality: studentProfile.vitality,
    totalMinutes: studentProfile.totalMinutes,
  }

  return (
    <div className="container py-8">
      <SchoolSetupBanner />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          안녕하세요, {session.user.name || "학생"}님! 👋
        </h1>
        <AIMessage studentData={studentData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 왼쪽: 아바타 정보 */}
        <div className="lg:col-span-1">
          <AvatarDisplay
            level={level}
            experience={currentXP}
            requiredXP={requiredXP}
            stats={{
              strength: studentProfile.strength,
              intelligence: studentProfile.intelligence,
              dexterity: studentProfile.dexterity,
              charisma: studentProfile.charisma,
              vitality: studentProfile.vitality,
            }}
          />
        </div>

        {/* 오른쪽: 대시보드 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 통계 카드 */}
          <DashboardStats
            totalDays={actualTotalDays}
            currentStreak={studentProfile.currentStreak}
            totalXP={studentProfile.totalXP}
            badgeCount={studentProfile.badges.length}
          />

          {/* 오늘의 계획 */}
          <TodayPlan plan={todayPlan} />

          {/* 성취도 추적 */}
          <AchievementTracker />

          {/* 최근 활동 */}
          <RecentActivities activities={studentProfile.activities} />
        </div>
      </div>
    </div>
  )
}