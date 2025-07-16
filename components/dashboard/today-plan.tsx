import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Plus } from "lucide-react"
import { Plan, PlanItem } from "@prisma/client"

interface TodayPlanProps {
  plan: (Plan & { items: PlanItem[] }) | null
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

export function TodayPlan({ plan }: TodayPlanProps) {
  if (!plan || plan.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오늘의 계획</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              아직 오늘의 계획을 작성하지 않았습니다
            </p>
            <Button asChild>
              <Link href="/dashboard/plan">
                <Plus className="mr-2 h-4 w-4" />
                계획 작성하기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completedItems = plan.items.filter(item => item.isCompleted).length
  const progress = (completedItems / plan.items.length) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>오늘의 계획</CardTitle>
          <div className="text-sm text-gray-500">
            {completedItems} / {plan.items.length} 완료
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {plan.items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                item.isCompleted ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    item.isCompleted ? "line-through text-gray-500" : ""
                  }`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={CATEGORY_COLORS[item.category]}
                    >
                      {CATEGORY_LABELS[item.category]}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {item.targetMinutes}분
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/activities">
              활동 기록하기
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}