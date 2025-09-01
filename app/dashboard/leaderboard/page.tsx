import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import LeaderboardClient from "@/components/features/LeaderboardClient"
import { startOfMonth, endOfMonth } from 'date-fns'

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // 이번 달 데이터만 가져오기
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // 이번 달 활동 집계
  const studentsWithMonthlyStats = await prisma.studentProfile.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
      activities: {
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }
    }
  })

  // 월간 통계 계산
  const studentsWithStats = studentsWithMonthlyStats.map(student => {
    const monthlyXP = student.activities.reduce((sum, a) => sum + a.xpEarned, 0)
    const monthlyMinutes = student.activities.reduce((sum, a) => sum + a.minutes, 0)
    
    return {
      ...student,
      monthlyXP,
      monthlyMinutes,
      activities: undefined // Remove activities array from response
    }
  }).filter(s => s.monthlyXP > 0) // Only include students with activity this month

  // XP 기준 상위 20명
  const topStudents = studentsWithStats
    .sort((a, b) => b.monthlyXP - a.monthlyXP)
    .slice(0, 20)

  // 활동 시간 기준 상위 10명
  const mostActiveStudents = studentsWithStats
    .sort((a, b) => b.monthlyMinutes - a.monthlyMinutes)
    .slice(0, 10)

  // 연속 출석 기준 (전체 데이터 사용)
  const longestStreaks = await prisma.studentProfile.findMany({
    orderBy: { currentStreak: "desc" },
    where: { currentStreak: { gt: 0 } },
    take: 10,
    include: {
      user: {
        select: { name: true },
      },
    },
  })

  const initialData = {
    topStudents,
    mostActiveStudents,
    longestStreaks,
    currentUserId: session.user.id
  }

  return <LeaderboardClient initialData={initialData} currentUserId={session.user.id} />
}