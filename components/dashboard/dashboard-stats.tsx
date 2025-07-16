import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Flame, Star, Trophy } from "lucide-react"

interface DashboardStatsProps {
  totalDays: number
  currentStreak: number
  totalXP: number
  badgeCount: number
}

export function DashboardStats({
  totalDays,
  currentStreak,
  totalXP,
  badgeCount,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "총 활동일",
      value: totalDays,
      unit: "일",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "연속 달성",
      value: currentStreak,
      unit: "일",
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "총 경험치",
      value: totalXP.toLocaleString(),
      unit: "XP",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "획득 배지",
      value: badgeCount,
      unit: "개",
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center p-6">
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">
                  {stat.value}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    {stat.unit}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}