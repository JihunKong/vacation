import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Activity } from "@prisma/client"
import { STAT_DESCRIPTIONS } from "@/lib/game/stats"

interface ActivityListProps {
  activities: Activity[]
}

const CATEGORY_LABELS = {
  STUDY: "학습",
  EXERCISE: "운동",
  READING: "독서",
  HOBBY: "취미",
  VOLUNTEER: "봉사",
  OTHER: "기타",
}

const CATEGORY_COLORS = {
  STUDY: "bg-blue-100 text-blue-800",
  EXERCISE: "bg-red-100 text-red-800",
  READING: "bg-green-100 text-green-800",
  HOBBY: "bg-purple-100 text-purple-800",
  VOLUNTEER: "bg-yellow-100 text-yellow-800",
  OTHER: "bg-gray-100 text-gray-800",
}

export function ActivityList({ activities }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        아직 기록된 활동이 없습니다
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const statPoints = activity.statPoints as Record<string, number>
        const gainedStats = Object.entries(statPoints)
          .filter(([_, value]) => value > 0)
          .map(([stat, value]) => ({
            stat: stat as keyof typeof STAT_DESCRIPTIONS,
            value,
          }))

        return (
          <div
            key={activity.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">{activity.title}</p>
                {activity.description && (
                  <p className="text-sm text-gray-600">{activity.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="secondary"
                    className={CATEGORY_COLORS[activity.category]}
                  >
                    {CATEGORY_LABELS[activity.category]}
                  </Badge>
                  <span className="text-gray-500">
                    {activity.minutes}분
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-green-600">
                  +{activity.xpEarned} XP
                </p>
                {gainedStats.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {gainedStats.map(({ stat, value }) => (
                      <div key={stat}>
                        {STAT_DESCRIPTIONS[stat].icon} +{value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}