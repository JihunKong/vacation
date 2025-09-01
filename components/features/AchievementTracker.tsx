'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Award, Calendar, Zap, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  title: string
  description: string
  icon: string
  progress: number
  target: number
  unlocked: boolean
  unlockedAt?: string
  xpReward: number
}

export default function AchievementTracker() {
  const [planStats, setPlanStats] = useState<PlanStats>({
    daily: { totalItems: 0, completedItems: 0, percentage: 0, streak: 0 },
    weekly: { totalItems: 0, completedItems: 0, percentage: 0, bestDay: '' },
    monthly: { totalItems: 0, completedItems: 0, percentage: 0, totalXP: 0 }
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

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
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            업적 & 도전과제
          </CardTitle>
          <CardDescription>
            목표를 달성하고 특별한 보상을 받아보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      {achievement.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    <div className="mt-2 space-y-1">
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
                    {achievement.unlocked && achievement.unlockedAt && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')} 달성
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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