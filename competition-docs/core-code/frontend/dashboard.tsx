import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AvatarDisplay } from "@/components/avatar/avatar-display"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { TodayPlan } from "@/components/dashboard/today-plan"
import { calculateLevel } from "@/lib/game/stats"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

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

  const { level, currentXP, requiredXP } = calculateLevel(studentProfile.totalXP)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          안녕하세요, {session.user.name || "학생"}님! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          오늘도 성장하는 하루 되세요!
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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

        <div className="lg:col-span-2 space-y-6">
          <DashboardStats
            totalDays={studentProfile.totalDays}
            currentStreak={studentProfile.currentStreak}
            totalXP={studentProfile.totalXP}
            badgeCount={studentProfile.badges.length}
          />

          <TodayPlan plan={todayPlan} />

          <RecentActivities activities={studentProfile.activities} />
        </div>
      </div>
    </div>
  )
}