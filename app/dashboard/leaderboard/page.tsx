import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Crown } from "lucide-react"

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // 전체 학생 순위 (XP 기준)
  const topStudents = await prisma.studentProfile.findMany({
    orderBy: { totalXP: "desc" },
    take: 20,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })

  // 활동 시간 기준 순위
  const mostActiveStudents = await prisma.studentProfile.findMany({
    orderBy: { totalMinutes: "desc" },
    take: 10,
    include: {
      user: {
        select: { name: true },
      },
    },
  })

  // 연속 출석 기준 순위
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Trophy className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-sm font-medium text-gray-500">{rank}</span>
    }
  }

  const getRankBadge = (rank: number): "default" | "secondary" | "destructive" | "outline" => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">리더보드</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 전체 순위 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              전체 순위 (경험치 기준)
            </CardTitle>
            <CardDescription>가장 많은 경험치를 획득한 학생들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStudents.map((student, index) => {
                const rank = index + 1
                const isCurrentUser = student.userId === session.user.id
                
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      isCurrentUser ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(rank)}
                      </div>
                      <Avatar>
                        <AvatarImage src={student.avatarImageUrl || undefined} />
                        <AvatarFallback>
                          {student.user.name?.[0] || student.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {student.user.name || student.user.email.split('@')[0]}
                          {isCurrentUser && <span className="text-blue-600 ml-2">(나)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">레벨 {student.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{student.totalXP.toLocaleString()} XP</p>
                        <p className="text-sm text-muted-foreground">{student.totalMinutes}분 활동</p>
                      </div>
                      {rank <= 3 && (
                        <Badge variant={getRankBadge(rank)}>
                          {rank}위
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 활동 시간 순위 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              가장 열심히 활동한 학생
            </CardTitle>
            <CardDescription>총 활동 시간 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostActiveStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-6">{index + 1}</span>
                    <p className="font-medium">
                      {student.user.name || "익명"}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {Math.floor(student.totalMinutes / 60)}시간 {student.totalMinutes % 60}분
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 연속 출석 순위 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              최장 연속 기록
            </CardTitle>
            <CardDescription>연속 활동 일수 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {longestStreaks.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-6">{index + 1}</span>
                    <p className="font-medium">
                      {student.user.name || "익명"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{student.currentStreak}일</p>
                    <span className="text-orange-500">🔥</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}