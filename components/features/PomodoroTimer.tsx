'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Target, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'STUDY', label: '학습', emoji: '📚' },
  { value: 'EXERCISE', label: '운동', emoji: '💪' },
  { value: 'READING', label: '독서', emoji: '📖' },
  { value: 'HOBBY', label: '취미', emoji: '🎨' },
  { value: 'VOLUNTEER', label: '봉사', emoji: '🤝' },
  { value: 'OTHER', label: '기타', emoji: '✨' }
]

interface PomodoroSession {
  id: string
  category: string
  title?: string
  targetMinutes: number
  isBreak: boolean
  startTime: string
}

interface SessionStats {
  totalSessions: number
  totalMinutes: number
  totalXP: number
}

export default function PomodoroTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25분 (초 단위)
  const [targetMinutes, setTargetMinutes] = useState(25)
  const [category, setCategory] = useState('STUDY')
  const [title, setTitle] = useState('')
  const [isBreak, setIsBreak] = useState(false)
  const [activeSession, setActiveSession] = useState<PomodoroSession | null>(null)
  const [todayStats, setTodayStats] = useState<SessionStats>({ totalSessions: 0, totalMinutes: 0, totalXP: 0 })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const serverSyncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 알림음 재생 함수
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const context = audioContextRef.current
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      
      // 비프음 설정
      oscillator.frequency.setValueAtTime(800, context.currentTime) // 800Hz
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, context.currentTime)
      
      // 페이드 아웃 효과
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)
      
      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.5)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }, [])

  // 세션 정보 로드
  const loadSessionData = useCallback(async () => {
    try {
      const res = await fetch('/api/pomodoro')
      if (res.ok) {
        const data = await res.json()
        setActiveSession(data.activeSession)
        setTodayStats(data.stats)
        
        // 활성 세션이 있으면 타이머 복원
        if (data.activeSession) {
          const elapsed = Math.floor((Date.now() - new Date(data.activeSession.startTime).getTime()) / 1000)
          const remaining = data.activeSession.targetMinutes * 60 - elapsed
          
          if (remaining > 0) {
            setTimeLeft(remaining)
            setTargetMinutes(data.activeSession.targetMinutes)
            setCategory(data.activeSession.category)
            setTitle(data.activeSession.title || '')
            setIsBreak(data.activeSession.isBreak)
            setIsRunning(true)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load session data:', error)
    }
  }, [])

  // 서버 타이머 상태 체크
  const checkServerTimerStatus = useCallback(async () => {
    if (!activeSession) return

    try {
      const res = await fetch('/api/pomodoro/status')
      if (res.ok) {
        const data = await res.json()
        
        if (data.timerExpired && data.sessionCompleted) {
          // 타이머가 서버에서 만료되고 완료 처리됨
          playNotificationSound()
          toast.success('세션이 완료되었습니다! 🎉')
          
          // 상태 초기화
          setActiveSession(null)
          setIsRunning(false)
          setIsPaused(false)
          setTimeLeft(25 * 60)
          setTargetMinutes(25)
          setIsBreak(false)
          setTitle('')
          
          // 통계 새로고침
          const res2 = await fetch('/api/pomodoro')
          if (res2.ok) {
            const data2 = await res2.json()
            setTodayStats(data2.stats)
          }
        } else if (data.hasActiveTimer && data.session) {
          // 서버의 남은 시간으로 동기화
          const remainingSeconds = data.session.remainingSeconds
          if (remainingSeconds > 0 && remainingSeconds !== timeLeft) {
            setTimeLeft(remainingSeconds)
          }
        }
      }
    } catch (error) {
      console.error('Failed to check server timer status:', error)
    }
  }, [activeSession, timeLeft, playNotificationSound])

  // 세션 완료 - useEffect 전에 정의 필요
  const completeSession = useCallback(async () => {
    if (!activeSession) return

    try {
      // 알림음 재생
      playNotificationSound()

      const res = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          action: 'complete'
        })
      })

      if (res.ok) {
        const result = await res.json()
        
        if (result.isFullSession && !isBreak) {
          toast.success(`세션 완료! +${result.bonusXP > 0 ? result.bonusXP + ' 보너스 ' : ''}XP 획득! 🎉`)
        } else if (isBreak) {
          toast.success('휴식 완료! 다시 집중해볼까요? 💪')
        }

        // 휴식/집중 모드 전환
        if (!isBreak) {
          // 집중 후 휴식 제안
          setIsBreak(true)
          setTargetMinutes(5)
          setTimeLeft(5 * 60)
          setTitle('')
        } else {
          // 휴식 후 집중 모드로
          setIsBreak(false)
          setTargetMinutes(25)
          setTimeLeft(25 * 60)
        }

        setActiveSession(null)
        setIsRunning(false)
        setIsPaused(false)
        await loadSessionData()
      }
    } catch (error) {
      toast.error('세션 완료 처리 중 오류가 발생했습니다')
    }
  }, [activeSession, isBreak, loadSessionData, playNotificationSound])

  useEffect(() => {
    loadSessionData()
  }, [loadSessionData])

  // 서버 타이머 동기화
  useEffect(() => {
    if (isRunning && !isPaused) {
      // 5초마다 서버 상태 체크
      serverSyncIntervalRef.current = setInterval(() => {
        checkServerTimerStatus()
      }, 5000)
    } else {
      if (serverSyncIntervalRef.current) {
        clearInterval(serverSyncIntervalRef.current)
        serverSyncIntervalRef.current = null
      }
    }

    return () => {
      if (serverSyncIntervalRef.current) {
        clearInterval(serverSyncIntervalRef.current)
      }
    }
  }, [isRunning, isPaused, checkServerTimerStatus])

  // 타이머 로직
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, timeLeft, completeSession])

  // 세션 시작
  const startSession = async () => {
    if (!category) {
      toast.error('카테고리를 선택해주세요')
      return
    }

    try {
      const res = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: title || undefined,
          targetMinutes,
          isBreak
        })
      })

      if (res.ok) {
        const session = await res.json()
        setActiveSession(session)
        setIsRunning(true)
        setIsPaused(false)
        setTimeLeft(targetMinutes * 60)
        toast.success(isBreak ? '휴식 시작! 🌱' : '집중 시작! 🚀')
      } else {
        const error = await res.json()
        toast.error(error.error || '세션을 시작할 수 없습니다')
      }
    } catch (error) {
      toast.error('세션 시작 중 오류가 발생했습니다')
    }
  }

  // 세션 취소
  const cancelSession = async () => {
    if (!activeSession) return

    try {
      const res = await fetch('/api/pomodoro', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          action: 'cancel'
        })
      })

      if (res.ok) {
        toast.info('세션이 취소되었습니다')
        setActiveSession(null)
        setIsRunning(false)
        setIsPaused(false)
        // 타이머 초기화 - 기본값으로 리셋
        setTimeLeft(25 * 60)
        setTargetMinutes(25)
        setIsBreak(false)
        setTitle('')
        await loadSessionData()
      }
    } catch (error) {
      toast.error('세션 취소 중 오류가 발생했습니다')
    }
  }

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 진행률 계산
  const progress = ((targetMinutes * 60 - timeLeft) / (targetMinutes * 60)) * 100

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6" />
            뽀모도로 타이머
          </h2>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              오늘: {todayStats.totalSessions}회
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {todayStats.totalMinutes}분
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              +{todayStats.totalXP} XP
            </Badge>
          </div>
        </div>

        {/* 타이머 디스플레이 */}
        <div className="relative">
          <div className="flex flex-col items-center justify-center py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={isBreak ? 'break' : 'focus'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="text-6xl font-mono font-bold mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-muted-foreground flex items-center justify-center gap-2">
                  {isBreak ? (
                    <>
                      <Coffee className="w-4 h-4" />
                      휴식 시간
                    </>
                  ) : (
                    <>
                      {CATEGORIES.find(c => c.value === category)?.emoji}
                      {title || CATEGORIES.find(c => c.value === category)?.label}
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* 진행 바 */}
            <div className="w-full max-w-md mt-6">
              <Progress value={progress} className="h-2" />
            </div>

            {/* 시각적 피드백 - 나무 성장 애니메이션 */}
            {isRunning && !isBreak && (
              <motion.div
                className="mt-8 text-6xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {progress < 25 ? '🌱' : progress < 50 ? '🌿' : progress < 75 ? '🌳' : '🌲'}
              </motion.div>
            )}
          </div>
        </div>

        {/* 컨트롤 */}
        {!isRunning ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={targetMinutes.toString()} 
                onValueChange={(v) => {
                  setTargetMinutes(parseInt(v))
                  setTimeLeft(parseInt(v) * 60)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15분</SelectItem>
                  <SelectItem value="25">25분 (권장)</SelectItem>
                  <SelectItem value="30">30분</SelectItem>
                  <SelectItem value="45">45분</SelectItem>
                  <SelectItem value="60">60분</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="무엇을 하시나요? (선택사항)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex gap-2">
              <Button 
                onClick={startSession}
                className="flex-1"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {isBreak ? '휴식 시작' : '집중 시작'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setIsBreak(!isBreak)
                  setTargetMinutes(isBreak ? 25 : 5)
                  setTimeLeft((isBreak ? 25 : 5) * 60)
                }}
              >
                {isBreak ? '집중 모드로' : '휴식 모드로'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant={isPaused ? 'default' : 'secondary'}
              className="flex-1"
              size="lg"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  재개
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  일시정지
                </>
              )}
            </Button>
            
            <Button
              onClick={cancelSession}
              variant="destructive"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              취소
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}