"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Heart } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface FeedbackViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityId: string
  studentName: string
  activityTitle: string
}

interface Feedback {
  id: string
  type: "FEEDBACK" | "ENCOURAGEMENT"
  message: string
  teacherId: string
  teacher: {
    name: string | null
    email: string
  }
  createdAt: string
}

export function FeedbackViewDialog({
  open,
  onOpenChange,
  activityId,
  studentName,
  activityTitle
}: FeedbackViewDialogProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && activityId) {
      fetchFeedbacks()
    }
  }, [open, activityId])

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/activities/${activityId}/feedbacks`)
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data.feedbacks || [])
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>피드백 내역</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">{studentName}</span>님의 &ldquo;{activityTitle}&rdquo; 활동에 대한 피드백
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 피드백이 없습니다.
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {feedback.type === "FEEDBACK" ? (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <Badge variant="outline" className="text-blue-600">
                          피드백
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <Badge variant="outline" className="text-red-600">
                          응원
                        </Badge>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(feedback.createdAt), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.message}</p>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <span>작성자: {feedback.teacher.name || feedback.teacher.email}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}