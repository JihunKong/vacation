"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Calendar, TrendingUp, Users, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface SchoolStats {
  totalStudents: number
  totalActivities: number
  totalMinutes: number
  averageMinutesPerStudent: number
  activeStudents: number
  categoryStats: {
    category: string
    count: number
    totalMinutes: number
  }[]
  weeklyTrend: {
    date: string
    count: number
    minutes: number
  }[]
}

export default function TeacherReportsPage() {
  const [stats, setStats] = useState<SchoolStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportPeriod, setExportPeriod] = useState("week")
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/teacher/reports")
      if (res.status === 403) {
        // 교사 권한이 없거나 학교 정보가 없는 경우
        setStats(null)
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error("Failed to fetch stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "오류",
        description: "통계를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "excel") => {
    try {
      const res = await fetch(`/api/teacher/export?format=${format}&period=${exportPeriod}`)
      if (!res.ok) throw new Error("Export failed")
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `학생활동보고서_${new Date().toISOString().split('T')[0]}.${format === "csv" ? "csv" : "xlsx"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "성공",
        description: "데이터를 성공적으로 내보냈습니다."
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "오류",
        description: "데이터 내보내기에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">학교 설정이 필요합니다</h2>
          <p className="text-muted-foreground mt-2">
            학교 보고서를 생성하기 위해 먼저 학교 정보를 설정해주세요.
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                학교를 설정하면 학생들의 활동 보고서를 생성할 수 있습니다.
              </div>
              <Button
                onClick={() => window.location.href = '/dashboard/profile'}
                className="w-full"
              >
                학교 설정하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">학교 활동 보고서</h1>
        <div className="flex gap-4">
          <Select value={exportPeriod} onValueChange={setExportPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">오늘</SelectItem>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
              <SelectItem value="all">전체</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport("csv")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            CSV 내보내기
          </Button>
          <Button onClick={() => handleExport("excel")}>
            <FileText className="mr-2 h-4 w-4" />
            Excel 내보내기
          </Button>
        </div>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 학생 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}명</div>
            <p className="text-xs text-muted-foreground">
              활동 학생: {stats.activeStudents}명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 활동 수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}개</div>
            <p className="text-xs text-muted-foreground">
              이번 주 활동
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학습 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(stats.totalMinutes / 60)}시간</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalMinutes % 60}분
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 학습 시간</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageMinutesPerStudent}분</div>
            <p className="text-xs text-muted-foreground">
              학생당 평균
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 활동 분석</CardTitle>
          <CardDescription>학생들의 활동 카테고리별 통계</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.categoryStats.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium w-20">{cat.category}</span>
                  <div className="w-64 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(cat.totalMinutes / stats.totalMinutes) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {cat.count}개 활동 / {cat.totalMinutes}분
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 주간 트렌드 */}
      <Card>
        <CardHeader>
          <CardTitle>주간 활동 트렌드</CardTitle>
          <CardDescription>최근 7일간 활동 추이</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.weeklyTrend.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {new Date(day.date).toLocaleDateString('ko-KR', { 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{day.count}개 활동</span>
                  <span className="text-sm text-gray-600">{day.minutes}분</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}