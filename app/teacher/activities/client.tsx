"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, User, MessageCircle, Trophy, Eye } from "lucide-react"
import FeedbackDialog from "@/components/teacher/feedback-dialog"
import { FeedbackViewDialog } from "@/components/teacher/feedback-view-dialog"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

// Category 매핑
const categoryMap = {
  STUDY: { label: "학습", color: "bg-blue-100 text-blue-800", icon: "📚" },
  EXERCISE: { label: "운동", color: "bg-green-100 text-green-800", icon: "💪" },
  READING: { label: "독서", color: "bg-purple-100 text-purple-800", icon: "📖" },
  HOBBY: { label: "취미", color: "bg-yellow-100 text-yellow-800", icon: "🎨" },
  VOLUNTEER: { label: "봉사", color: "bg-pink-100 text-pink-800", icon: "❤️" },
  OTHER: { label: "기타", color: "bg-gray-100 text-gray-800", icon: "📝" },
}

interface Activity {
  id: string
  title: string
  description?: string | null
  category: keyof typeof categoryMap
  minutes: number
  date: string
  xpEarned: number
  student: {
    id: string
    user: {
      name: string | null
      email: string
    }
  }
  feedbacks: any[]
}

interface TeacherActivitiesClientProps {
  activities: Activity[]
}

export default function TeacherActivitiesClient({ activities }: TeacherActivitiesClientProps) {
  const [viewFeedbackModal, setViewFeedbackModal] = useState<{
    open: boolean
    activityId: string
    studentName: string
    activityTitle: string
  }>({
    open: false,
    activityId: "",
    studentName: "",
    activityTitle: ""
  })

  const handleViewFeedback = (activity: Activity) => {
    setViewFeedbackModal({
      open: true,
      activityId: activity.id,
      studentName: activity.student.user.name || activity.student.user.email,
      activityTitle: activity.title
    })
  }

  return (
    <>
      <div className="space-y-4">
        {activities.map((activity) => {
          const categoryInfo = categoryMap[activity.category] || categoryMap.OTHER
          const hasGivenFeedback = activity.feedbacks.length > 0

          return (
            <Card key={activity.id} className={hasGivenFeedback ? "border-green-200 bg-green-50/30" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{categoryInfo.icon}</span>
                      <Badge className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                      {hasGivenFeedback && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          피드백 완료
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{activity.student.user.name || activity.student.user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(activity.date), "yyyy년 MM월 dd일", { locale: ko })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{activity.minutes}분</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>{activity.xpEarned} XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {hasGivenFeedback ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewFeedback(activity)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        피드백 보기
                      </Button>
                    ) : (
                      <FeedbackDialog
                        activityId={activity.id}
                        studentId={activity.student.id}
                        studentName={activity.student.user.name || activity.student.user.email}
                        activityTitle={activity.title}
                        disabled={false}
                      />
                    )}
                  </div>
                </div>
              </CardHeader>
              {activity.description && (
                <CardContent>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">
                    {activity.description}
                  </p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <FeedbackViewDialog
        open={viewFeedbackModal.open}
        onOpenChange={(open) => setViewFeedbackModal(prev => ({ ...prev, open }))}
        activityId={viewFeedbackModal.activityId}
        studentName={viewFeedbackModal.studentName}
        activityTitle={viewFeedbackModal.activityTitle}
      />
    </>
  )
}