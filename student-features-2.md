# 06. 학생 기능 구현 (계속)

## 3. 리더보드 페이지

`app/(main)/leaderboard/page.tsx` 파일 생성:

```typescript
import { requireAuth } from "@/lib/auth/auth-utils"
import { LeaderboardClient } from "./leaderboard-client"

export default async function LeaderboardPage() {
  const user = await requireAuth()
  
  return <LeaderboardClient user={user} />
}
```

`app/(main)/leaderboard/leaderboard-client.tsx` 파일 생성:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Flame, TrendingUp, Medal, Crown, Award } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface LeaderboardClientProps {
  user: any
}

export function LeaderboardClient({ user }: LeaderboardClientProps) {
  const [loading, setLoading] = useState(true)
  const [leaderboardData, setLeaderboardData] = useState<any>({})
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("level")

  useEffect(() => {
    fetchLeaderboard(activeTab)
  }, [activeTab, selectedClass])

  const fetchLeaderboard = async (type: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type })
      if (selectedClass !== "all") {
        params.append("classId", selectedClass)
      }
      
      const response = await fetch(`/api/stats/leaderboard?${params}`)
      const data = await response.json()
      
      setLeaderboardData(prev => ({
        ...prev,
        [type]: data.data
      }))
    } catch (error) {
      console.error("Leaderboard fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300"
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-300"
      case 3:
        return "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300"
      default:
        return ""
    }
  }

  const renderLeaderboardItem = (item: any, index: number, type: string) => {
    const rank = index + 1
    const isCurrentUser = item.id === user.id
    
    return (
      <div
        key={item.id}
        className={`
          flex items-center justify-between p-4 rounded-lg border transition-all
          ${getRankStyle(rank)}
          ${isCurrentUser ? "ring-2 ring-primary ring-offset-2" : ""}
          hover:shadow-md
        `}
      >
        <div className="flex items-center space-x-4">
          <div className="w-8 flex justify-center">
            {getRankIcon(rank)}
          </div>
          
          <Avatar>
            <AvatarImage src={item.image} />
            <AvatarFallback>
              {item.nickname?.[0] || item.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium">
                {item.nickname || item.name}
              </p>
              {isCurrentUser && (
                <Badge variant="secondary" className="text-xs">
                  나
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Lv.{item.level}</span>
              {item.classId && (
                <>
                  <span>•</span>
                  <span>{item.classId}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {type === "level" && (
            <div>
              <p className="font-bold text-lg">
                <AnimatedCounter value={item.totalExp} suffix=" EXP" />
              </p>
              <p className="text-sm text-muted-foreground">
                레벨 {item.level}
              </p>
            </div>
          )}
          
          {type === "streak" && (
            <div>
              <p className="font-bold text-lg flex items-center">
                <Flame className="h-4 w-4 mr-1 text-orange-500" />
                <AnimatedCounter value={item.currentStreak} suffix="일" />
              </p>
              <p className="text-sm text-muted-foreground">
                연속 달성
              </p>
            </div>
          )}
          
          {type === "weekly" && (
            <div>
              <p className="font-bold text-lg">
                <AnimatedCounter value={item.weeklyExp} suffix=" EXP" />
              </p>
              <p className="text-sm text-muted-foreground">
                이번 주 획득
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">리더보드</h1>
          <p className="text-muted-foreground">
            다른 학생들과 함께 성장해요!
          </p>
        </div>
        
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="2-1">2-1</SelectItem>
            <SelectItem value="2-2">2-2</SelectItem>
            <SelectItem value="2-3">2-3</SelectItem>
            <SelectItem value="2-4">2-4</SelectItem>
            <SelectItem value="2-5">2-5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 현재 순위 요약 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              레벨 순위
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {leaderboardData.level?.currentUserRank || "-"}위
            </p>
            <p className="text-xs text-muted-foreground">
              전체 {leaderboardData.level?.leaderboard?.length || 0}명 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Flame className="h-4 w-4 mr-2" />
              연속 달성 순위
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {leaderboardData.streak?.currentUserRank || "-"}위
            </p>
            <p className="text-xs text-muted-foreground">
              전체 {leaderboardData.streak?.leaderboard?.length || 0}명 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              주간 순위
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {leaderboardData.weekly?.currentUserRank || "-"}위
            </p>
            <p className="text-xs text-muted-foreground">
              전체 {leaderboardData.weekly?.leaderboard?.length || 0}명 중
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 리더보드 탭 */}
      <Card>
        <CardHeader>
          <CardTitle>순위표</CardTitle>
          <CardDescription>
            상위 50명의 학생들이 표시됩니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="level">
                <Trophy className="h-4 w-4 mr-2" />
                레벨
              </TabsTrigger>
              <TabsTrigger value="streak">
                <Flame className="h-4 w-4 mr-2" />
                연속 달성
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <TrendingUp className="h-4 w-4 mr-2" />
                주간
              </TabsTrigger>
            </TabsList>

            <TabsContent value="level" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboardData.level?.leaderboard?.map((item: any, index: number) => 
                    renderLeaderboardItem(item, index, "level")
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="streak" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboardData.streak?.leaderboard?.map((item: any, index: number) => 
                    renderLeaderboardItem(item, index, "streak")
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="weekly" className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboardData.weekly?.leaderboard?.map((item: any, index: number) => 
                    renderLeaderboardItem(item, index, "weekly")
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 4. 프로필 페이지

`app/(main)/profile/page.tsx` 파일 생성:

```typescript
import { requireAuth } from "@/lib/auth/auth-utils"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const user = await requireAuth()
  
  return <ProfileClient user={user} />
}
```

`app/(main)/profile/profile-client.tsx` 파일 생성:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { CategoryGif } from "@/components/ui/category-gif"
import { ExpProgress } from "@/components/ui/exp-progress"
import { 
  User, 
  Trophy, 
  Target, 
  Clock,
  Edit2,
  Save,
  X
} from "lucide-react"
import { formatTime } from "@/lib/utils/date"
import { Category } from "@prisma/client"

interface ProfileClientProps {
  user: any
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [achievements, setAchievements] = useState<any>([])
  const [nickname, setNickname] = useState(user.nickname || "")
  const [classId, setClassId] = useState(user.classId || "")

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      // 통계 가져오기
      const statsRes = await fetch("/api/stats")
      const statsData = await statsRes.json()
      
      // 업적 가져오기
      const achievementsRes = await fetch("/api/achievements")
      const achievementsData = await achievementsRes.json()
      
      setStats(statsData.data)
      setAchievements(achievementsData.data)
    } catch (error) {
      console.error("Profile data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, classId })
      })

      if (!response.ok) {
        throw new Error("프로필 업데이트 실패")
      }

      toast({
        title: "프로필이 업데이트되었습니다"
      })
      
      setEditing(false)
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        variant: "destructive"
      })
    }
  }

  const categoryStats = [
    { category: "STUDY" as Category, time: stats?.overall?.studyTime || 0 },
    { category: "EXERCISE" as Category, time: stats?.overall?.exerciseTime || 0 },
    { category: "READING" as Category, time: stats?.overall?.readingTime || 0 },
    { category: "VOLUNTEER" as Category, time: stats?.overall?.volunteerTime || 0 },
    { category: "HOBBY" as Category, time: stats?.overall?.hobbyTime || 0 },
    { category: "SOCIAL" as Category, time: stats?.overall?.socialTime || 0 },
  ]

  const totalTime = categoryStats.reduce((sum, cat) => sum + cat.time, 0)

  return (
    <div className="space-y-6">
      {/* 프로필 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>프로필</CardTitle>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                수정
              </Button>
            ) : (
              <div className="space-x-2">
                <Button size="sm" onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditing(false)
                    setNickname(user.nickname || "")
                    setClassId(user.classId || "")
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image} />
              <AvatarFallback className="text-2xl">
                {user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="리더보드에 표시될 닉네임"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classId">학급</Label>
                    <Input
                      id="classId"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      placeholder="예: 2-3"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.nickname || user.name}
                    </h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    {user.classId && (
                      <Badge variant="secondary" className="mt-2">
                        {user.classId}반
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-muted-foreground">레벨</p>
                      <p className="text-2xl font-bold">{user.level}</p>
                    </div>
                    <div className="flex-1">
                      <ExpProgress totalExp={user.totalExp} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 및 업적 탭 */}
      <Tabs defaultValue="stats">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">통계</TabsTrigger>
          <TabsTrigger value="achievements">업적</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          {/* 전체 통계 */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  총 활동 시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatTime(totalTime)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  현재 연속 일수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats?.overall?.currentStreak || 0}일
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  총 활동 일수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats?.overall?.totalDays || 0}일
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 카테고리별 통계 */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 활동 시간</CardTitle>
              <CardDescription>
                지금까지의 모든 활동 기록입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryStats.map((stat) => (
                  <div
                    key={stat.category}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <CategoryGif category={stat.category} size={60} />
                    <div className="flex-1">
                      <p className="font-medium">
                        {stat.category === "STUDY" && "학습"}
                        {stat.category === "EXERCISE" && "운동"}
                        {stat.category === "READING" && "독서"}
                        {stat.category === "VOLUNTEER" && "봉사"}
                        {stat.category === "HOBBY" && "취미"}
                        {stat.category === "SOCIAL" && "사회활동"}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatTime(stat.time)}
                      </p>
                      <Progress 
                        value={(stat.time / totalTime) * 100} 
                        className="mt-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>획득한 업적</CardTitle>
              <CardDescription>
                {achievements?.unlocked?.length || 0}개의 업적을 달성했습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements?.all?.map((achievement: any) => (
                  <div
                    key={achievement.type}
                    className={`
                      p-4 border rounded-lg
                      ${achievement.unlocked 
                        ? "bg-secondary" 
                        : "opacity-50 grayscale"
                      }
                    `}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}에 달성
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## 다음 단계
학생 기능 구현이 완료되었습니다. 다음은 `07-teacher-features.md`를 참고하여 교사 기능을 구현하세요.