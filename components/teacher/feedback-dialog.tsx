"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MessageCircle, Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FeedbackDialogProps {
  activityId: string
  studentId: string
  studentName: string
  activityTitle: string
  disabled?: boolean
}

export default function FeedbackDialog({
  activityId,
  studentId,
  studentName,
  activityTitle,
  disabled = false
}: FeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [type, setType] = useState<"FEEDBACK" | "ENCOURAGEMENT">("ENCOURAGEMENT")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      toast.error("메시지를 입력해주세요.")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch("/api/teacher/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId,
          studentId,
          message: message.trim(),
          type,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "피드백 전송에 실패했습니다.")
      }

      toast.success(
        type === "FEEDBACK" 
          ? "피드백이 성공적으로 전송되었습니다!" 
          : "응원 메시지가 성공적으로 전송되었습니다!"
      )
      
      setOpen(false)
      setMessage("")
      setType("ENCOURAGEMENT")
      
      // 페이지 새로고침으로 UI 업데이트
      window.location.reload()
      
    } catch (error) {
      console.error("Error sending feedback:", error)
      toast.error(error instanceof Error ? error.message : "피드백 전송에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        <MessageCircle className="w-4 h-4 mr-2" />
        피드백 완료
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          피드백하기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>학생 피드백</DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{studentName}</span>님의 &ldquo;{activityTitle}&rdquo; 활동에 대한 피드백을 작성해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label>피드백 유형</Label>
              <RadioGroup value={type} onValueChange={(value) => setType(value as "FEEDBACK" | "ENCOURAGEMENT")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ENCOURAGEMENT" id="encouragement" />
                  <Label htmlFor="encouragement" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="w-4 h-4 text-pink-500" />
                    응원 메시지 - 학생을 격려하고 동기부여
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEEDBACK" id="feedback" />
                  <Label htmlFor="feedback" className="flex items-center gap-2 cursor-pointer">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    피드백 - 구체적인 조언과 개선점 제시
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">메시지</Label>
              <Textarea
                id="message"
                placeholder={
                  type === "ENCOURAGEMENT"
                    ? "학생을 격려하는 따뜻한 메시지를 작성해주세요. 예: '정말 꾸준히 노력하고 있네요! 이런 모습이 너무 대견스러워요.'"
                    : "구체적이고 건설적인 피드백을 제공해주세요. 예: '학습 시간을 더 효과적으로 활용하려면 짧은 휴식을 포함한 계획을 세워보는 것을 추천해요.'"
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
                required
              />
              <p className="text-sm text-gray-500">
                {type === "ENCOURAGEMENT" ? "격려와 칭찬" : "조언과 개선점"}에 중점을 둔 메시지를 작성해주세요.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  전송 중...
                </>
              ) : (
                <>
                  {type === "ENCOURAGEMENT" ? (
                    <Heart className="w-4 h-4 mr-2" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  {type === "ENCOURAGEMENT" ? "응원하기" : "피드백 전송"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}