'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, TrendingUp, Award, Calendar, Zap, CheckCircle2, Trophy, Star, Filter, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PlanStats {
  daily: {
    totalItems: number
    completedItems: number
    percentage: number
    streak: number
  }
  weekly: {
    totalItems: number
    completedItems: number
    percentage: number
    bestDay: string
  }
  monthly: {
    totalItems: number
    completedItems: number
    percentage: number
    totalXP: number
  }
}

interface Achievement {
  id: string
  code: string
  title: string
  description: string
  icon: string
  category: string
  difficulty: string
  progress: number
  target: number
  completed: boolean
  completedAt?: string
  xpReward: number
  isMonthly?: boolean
  claimedReward?: boolean
}

export default function AchievementTracker() {
  const [planStats, setPlanStats] = useState<PlanStats>({
    daily: { totalItems: 0, completedItems: 0, percentage: 0, streak: 0 },
    weekly: { totalItems: 0, completedItems: 0, percentage: 0, bestDay: '' },
    monthly: { totalItems: 0, completedItems: 0, percentage: 0, totalXP: 0 }
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [statsRes, achievementsRes] = await Promise.all([
        fetch('/api/stats/plan-execution'),
        fetch('/api/achievements')
      ])

      if (statsRes.ok) {
        const stats = await statsRes.json()
        setPlanStats(stats)
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json()
        setAchievements(achievementsData)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getPercentageEmoji = (percentage: number) => {
    if (percentage >= 90) return '🔥'
    if (percentage >= 70) return '💪'
    if (percentage >= 50) return '👍'
    return '💡'
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 계획 실행률 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            계획 실행률
          </CardTitle>
          <CardDescription>
            설정한 계획 대비 실제 달성도를 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">일간</TabsTrigger>
              <TabsTrigger value="weekly">주간</TabsTrigger>
              <TabsTrigger value="monthly">월간</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">오늘의 달성률</span>
                  <span className={`text-2xl font-bold ${getPercentageColor(planStats.daily.percentage)}`}>
                    {planStats.daily.percentage}% {getPercentageEmoji(planStats.daily.percentage)}
                  </span>
                </div>
                <Progress value={planStats.daily.percentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{planStats.daily.completedItems} / {planStats.daily.totalItems} 완료</span>
                  <span>연속 {planStats.daily.streak}일째</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">이번 주 달성률</span>
                  <span className={`text-2xl font-bold ${getPercentageColor(planStats.weekly.percentage)}`}>
                    {planStats.weekly.percentage}% {getPercentageEmoji(planStats.weekly.percentage)}
                  </span>
                </div>
                <Progress value={planStats.weekly.percentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{planStats.weekly.completedItems} / {planStats.weekly.totalItems} 완료</span>
                  <span>최고 {planStats.weekly.bestDay}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">이번 달 달성률</span>
                  <span className={`text-2xl font-bold ${getPercentageColor(planStats.monthly.percentage)}`}>
                    {planStats.monthly.percentage}% {getPercentageEmoji(planStats.monthly.percentage)}
                  </span>
                </div>
                <Progress value={planStats.monthly.percentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{planStats.monthly.completedItems} / {planStats.monthly.totalItems} 완료</span>
                  <span>총 {planStats.monthly.totalXP} XP 획득</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 업적 시스템 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                업적 & 도전과제
              </CardTitle>
              <CardDescription>
                목표를 달성하고 특별한 보상을 받아보세요
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 도전과제</SelectItem>
                  <SelectItem value="monthly">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      월별 특별
                    </span>
                  </SelectItem>
                  <SelectItem value="STUDY">학습</SelectItem>
                  <SelectItem value="FITNESS">운동</SelectItem>
                  <SelectItem value="READING">독서</SelectItem>
                  <SelectItem value="SPECIAL">특별</SelectItem>
                  <SelectItem value="STREAK">연속</SelectItem>
                  <SelectItem value="LEVEL">레벨</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showCompleted ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? '전체' : '진행중'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 월별 특별 도전과제 섹션 */}
          {filter === 'all' && achievements.some(a => a.isMonthly) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">{new Date().getMonth() + 1}월 특별 도전과제</h3>
                <Badge variant="outline" className="ml-auto text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}일 남음
                </Badge>
              </div>
              <div className="grid gap-3">
                {achievements
                  .filter(a => a.isMonthly)
                  .map(achievement => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
              </div>
            </div>
          )}

          {/* 일반 도전과제 그리드 */}
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {achievements
                .filter(a => {
                  if (!showCompleted && a.completed) return false
                  if (filter === 'all') return !a.isMonthly
                  if (filter === 'monthly') return a.isMonthly
                  return a.category === filter && !a.isMonthly
                })
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* 동기부여 메시지 */}
      {planStats.daily.percentage >= 90 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">훌륭해요! 🎉</p>
              <p className="text-sm text-purple-700">
                오늘의 목표를 거의 다 달성했어요. 조금만 더 힘내세요!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// 도전과제 카드 컴포넌트
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [claiming, setClaiming] = useState(false)
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'EASY': return 'text-green-600 bg-green-50'
      case 'MEDIUM': return 'text-blue-600 bg-blue-50'
      case 'HARD': return 'text-purple-600 bg-purple-50'
      case 'LEGENDARY': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  const getDifficultyLabel = (difficulty: string) => {
    switch(difficulty) {
      case 'EASY': return '쉬움'
      case 'MEDIUM': return '보통'
      case 'HARD': return '어려움'
      case 'LEGENDARY': return '전설'
      default: return difficulty
    }
  }
  
  const handleClaimReward = async () => {
    if (!achievement.completed || achievement.claimedReward) return
    
    setClaiming(true)
    try {
      const res = await fetch('/api/achievements/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId: achievement.id })
      })
      
      if (res.ok) {
        // 리로드하여 업데이트된 데이터 가져오기
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to claim reward:', error)
    } finally {
      setClaiming(false)
    }
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border transition-all ${
        achievement.completed 
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-md' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-3xl ${achievement.completed ? 'animate-pulse' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{achievement.title}</h4>
            {achievement.completed && (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
            {achievement.isMonthly && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                월별
              </Badge>
            )}
          </div>
          
          <Badge className={`text-xs mb-2 ${getDifficultyColor(achievement.difficulty)}`}>
            {getDifficultyLabel(achievement.difficulty)}
          </Badge>
          
          <p className="text-sm text-muted-foreground mb-3">
            {achievement.description}
          </p>
          
          <div className="space-y-2">
            <Progress 
              value={(achievement.progress / achievement.target) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{achievement.progress} / {achievement.target}</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                +{achievement.xpReward} XP
              </span>
            </div>
          </div>
          
          {achievement.completed && (
            <div className="mt-3">
              {achievement.claimedReward ? (
                <Badge variant="secondary" className="text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  보상 수령 완료
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={handleClaimReward}
                  disabled={claiming}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                >
                  {claiming ? '수령 중...' : '보상 수령하기'}
                </Button>
              )}
              {achievement.completedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(achievement.completedAt).toLocaleDateString('ko-KR')} 달성
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}