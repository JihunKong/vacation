import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "@prisma/client"

interface RecentActivitiesProps {
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

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            아직 기록된 활동이 없습니다
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="space-y-1">
                <p className="font-medium">{activity.title}</p>
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
              <div className="text-right">
                <p className="font-bold text-green-600">
                  +{activity.xpEarned} XP
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}