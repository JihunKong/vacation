'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, Crown, Calendar, School, Globe } from "lucide-react"
import { format, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'

interface LeaderboardData {
  topStudents: any[]
  mostActiveStudents: any[]
  longestStreaks: any[]
  currentUserId: string
  userSchool?: any
}

export default function LeaderboardClient({ initialData, currentUserId }: { initialData: LeaderboardData, currentUserId: string }) {
  const [data, setData] = useState(initialData)
  const [selectedMonth, setSelectedMonth] = useState('current')
  const [schoolOnly, setSchoolOnly] = useState(false)
  const [loading, setLoading] = useState(false)

  // 최근 12개월 옵션 생성
  const monthOptions = [
    { value: 'current', label: '이번 달' },
    ...Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i + 1)
      return {
        value: format(date, 'yyyy-MM'),
        label: format(date, 'yyyy년 M월', { locale: ko })
      }
    })
  ]

  const loadLeaderboard = async (period: string, schoolFilter: boolean) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        period,
        schoolOnly: schoolFilter.toString()
      })
      const res = await fetch(`/api/leaderboard?${params}`)
      if (res.ok) {
        const newData = await res.json()
        setData(newData)
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard(selectedMonth, schoolOnly)
  }, [selectedMonth, schoolOnly])

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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">리더보드</h1>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="월 선택" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* 학교별/전체 필터 버튼 */}
        <div className="flex gap-2">
          <Button
            variant={!schoolOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setSchoolOnly(false)}
          >
            <Globe className="h-4 w-4 mr-2" />
            전체
          </Button>
          <Button
            variant={schoolOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setSchoolOnly(true)}
          >
            <School className="h-4 w-4 mr-2" />
            우리 학교
          </Button>
        </div>
        
        {/* 현재 필터 상태 표시 */}
        {schoolOnly && data.userSchool && (
          <div className="mt-2">
            <Badge variant="secondary">
              <School className="h-3 w-3 mr-1" />
              {data.userSchool.name}
            </Badge>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 전체 순위 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {selectedMonth === 'current' ? '이번 달' : selectedMonth} 순위 (경험치 기준)
              </CardTitle>
              <CardDescription>
                {selectedMonth === 'current' ? '이번 달 가장 많은 경험치를 획득한 학생들' : '해당 월 경험치 순위'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topStudents.map((student: any, index: number) => {
                  const rank = index + 1
                  const isCurrentUser = student.userId === currentUserId
                  
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
                            {student.user?.name?.[0] || student.user?.email?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {student.user?.name || student.user?.email?.split('@')[0] || '익명'}
                            {isCurrentUser && <span className="text-blue-600 ml-2">(나)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">레벨 {student.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {(student.monthlyXP || student.totalXP || 0).toLocaleString()} XP
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.monthlyMinutes || student.totalMinutes || 0}분 활동
                          </p>
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
                {data.topStudents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    해당 기간에 활동한 학생이 없습니다.
                  </p>
                )}
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
              <CardDescription>
                {selectedMonth === 'current' ? '이번 달' : selectedMonth} 활동 시간 기준
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.mostActiveStudents.map((student: any, index: number) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-6">{index + 1}</span>
                      <p className="font-medium">
                        {student.user?.name || "익명"}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {Math.floor((student.monthlyMinutes || student.totalMinutes || 0) / 60)}시간{' '}
                      {(student.monthlyMinutes || student.totalMinutes || 0) % 60}분
                    </p>
                  </div>
                ))}
                {data.mostActiveStudents.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    활동 기록이 없습니다.
                  </p>
                )}
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
              <CardDescription>
                {selectedMonth === 'current' ? '현재' : selectedMonth} 연속 활동 일수
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.longestStreaks.map((student: any, index: number) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-6">{index + 1}</span>
                      <p className="font-medium">
                        {student.user?.name || "익명"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{student.currentStreak || 0}일</p>
                      <span className="text-orange-500">🔥</span>
                    </div>
                  </div>
                ))}
                {data.longestStreaks.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    연속 활동 기록이 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}