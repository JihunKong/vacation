'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { TrendingUp, Calendar, Clock, Target, Activity } from 'lucide-react'

interface ChartData {
  daily: Array<{ date: string; xp: number; minutes: number; activities: number }>
  weekly: Array<{ week: string; xp: number; minutes: number; activities: number }>
  monthly: Array<{ month: string; xp: number; minutes: number; activities: number }>
  categoryBreakdown: Array<{ category: string; value: number; color: string }>
  hourlyHeatmap: Array<{ hour: number; day: number; value: number }>
  statRadar: Array<{ stat: string; value: number; fullMark: number }>
}

const CATEGORY_COLORS = {
  STUDY: '#8B5CF6',
  EXERCISE: '#EF4444',
  READING: '#3B82F6',
  HOBBY: '#10B981',
  VOLUNTEER: '#F59E0B',
  OTHER: '#6B7280'
}

const CATEGORY_LABELS = {
  STUDY: '학습',
  EXERCISE: '운동',
  READING: '독서',
  HOBBY: '취미',
  VOLUNTEER: '봉사',
  OTHER: '기타'
}

export default function GrowthCharts() {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [metric, setMetric] = useState<'xp' | 'minutes' | 'activities'>('xp')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    try {
      const res = await fetch('/api/stats/charts')
      if (res.ok) {
        const data = await res.json()
        setChartData(data)
      }
    } catch (error) {
      console.error('Failed to load chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !chartData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'xp': return 'XP 획득량'
      case 'minutes': return '학습 시간(분)'
      case 'activities': return '활동 수'
      default: return metric
    }
  }

  const formatTooltipValue = (value: number, metric: string) => {
    switch (metric) {
      case 'xp': return `${value} XP`
      case 'minutes': return `${value}분`
      case 'activities': return `${value}개`
      default: return value
    }
  }

  return (
    <div className="space-y-6">
      {/* 성장 추이 차트 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                성장 그래프
              </CardTitle>
              <CardDescription>
                시간에 따른 성장 추이를 확인하세요
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="기간" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">일간</SelectItem>
                  <SelectItem value="weekly">주간</SelectItem>
                  <SelectItem value="monthly">월간</SelectItem>
                </SelectContent>
              </Select>
              <Select value={metric} onValueChange={(v: any) => setMetric(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="지표" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xp">XP</SelectItem>
                  <SelectItem value="minutes">시간</SelectItem>
                  <SelectItem value="activities">활동</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData[period]}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month'} 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => formatTooltipValue(value, metric)}
                labelStyle={{ color: '#000' }}
              />
              <Area 
                type="monotone" 
                dataKey={metric} 
                stroke="#8B5CF6" 
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 카테고리별 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              카테고리별 활동 분포
            </CardTitle>
            <CardDescription>
              어떤 분야에 시간을 투자했는지 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 능력치 레이더 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              능력치 밸런스
            </CardTitle>
            <CardDescription>
              균형잡힌 성장을 추구하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={chartData.statRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="현재 능력치" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 시간대별 히트맵 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            활동 패턴 분석
          </CardTitle>
          <CardDescription>
            가장 활발한 시간대를 파악하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-0.5 text-[10px]">
              <div className="col-span-1"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-[10px] text-center text-muted-foreground">
                  {i}
                </div>
              ))}
            </div>
            {['월', '화', '수', '목', '금', '토', '일'].map((day, dayIndex) => (
              <div key={day} className="grid grid-cols-[auto_repeat(24,1fr)] gap-0.5 items-center">
                <div className="text-[10px] text-muted-foreground pr-1">{day}</div>
                {Array.from({ length: 24 }, (_, hourIndex) => {
                  const data = chartData.hourlyHeatmap.find(
                    d => d.day === dayIndex && d.hour === hourIndex
                  )
                  const intensity = data ? data.value : 0
                  const opacity = intensity / 10 // 0 to 1 scale
                  
                  return (
                    <div
                      key={hourIndex}
                      className="aspect-square rounded-sm w-full"
                      style={{
                        backgroundColor: `rgba(139, 92, 246, ${opacity})`,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                      title={`${day} ${hourIndex}시: ${intensity}회`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>적음</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(opacity => (
                <div
                  key={opacity}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: `rgba(139, 92, 246, ${opacity})` }}
                />
              ))}
            </div>
            <span>많음</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}