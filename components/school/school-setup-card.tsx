'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { School, Settings, Users, Trophy } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function SchoolSetupCard() {
  const [hasSchool, setHasSchool] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    checkSchoolStatus()
  }, [])

  const checkSchoolStatus = async () => {
    try {
      const res = await fetch('/api/user/school')
      if (res.ok) {
        const data = await res.json()
        console.log('School status:', data) // 디버깅용
        setHasSchool(!!data.schoolId)
        setUserRole(data.role)
      } else {
        console.error('Failed to fetch school status:', res.status)
        setHasSchool(false)
      }
    } catch (error) {
      console.error('Failed to check school status:', error)
      setHasSchool(false)
    } finally {
      setLoading(false)
    }
  }

  // 로딩 중이거나 이미 학교가 설정된 경우 표시하지 않음
  if (loading) {
    return null
  }

  if (hasSchool) {
    return null
  }

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <School className="h-5 w-5 text-blue-600" />
          <CardTitle>학교를 설정하고 더 많은 기능을 이용하세요!</CardTitle>
        </div>
        <CardDescription>
          학교를 설정하면 우리 학교 친구들과 함께 경쟁하고 성장할 수 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">학교별 리더보드</p>
              <p className="text-xs text-muted-foreground">
                우리 학교 학생들과 순위 경쟁
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">친구와 함께</p>
              <p className="text-xs text-muted-foreground">
                같은 학교 친구들과 함께 학습
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">교사 연결</p>
              <p className="text-xs text-muted-foreground">
                선생님과 학습 현황 공유
              </p>
            </div>
          </div>
        </div>
        <Link href="/dashboard/profile">
          <Button className="w-full">
            <School className="h-4 w-4 mr-2" />
            프로필에서 학교 설정하기
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}