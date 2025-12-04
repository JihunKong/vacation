import { Redis } from 'ioredis'

let redis: Redis | null = null
let isRedisAvailable = true

export function getRedis(): Redis | null {
  if (!redis && isRedisAvailable) {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
      redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 3) {
            isRedisAvailable = false
            console.warn('Redis is not available, falling back to in-memory timer')
            return null
          }
          return Math.min(times * 50, 2000)
        },
        maxRetriesPerRequest: 3
      })
      
      redis.on('error', (err) => {
        console.error('Redis connection error:', err)
        isRedisAvailable = false
      })
      
      redis.on('connect', () => {
        console.log('Redis connected successfully')
        isRedisAvailable = true
      })
    } catch (error) {
      console.error('Failed to initialize Redis:', error)
      isRedisAvailable = false
    }
  }
  
  return isRedisAvailable ? redis : null
}

// 메모리 저장소 (Redis가 없을 때 대체)
const memoryStore = new Map<string, { data: any, expireAt: number }>()

// 메모리 저장소 자동 정리 (5분마다 실행)
if (typeof window === 'undefined') { // 서버 사이드에서만 실행
  setInterval(() => {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, value] of memoryStore.entries()) {
      if (value.expireAt <= now) {
        memoryStore.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`[Redis Fallback] Cleaned up ${cleanedCount} expired entries from memory store`)
    }
  }, 300000) // 5분마다 정리
}

// 타이머 관련 유틸리티 함수들
export const TimerService = {
  // 타이머 세션 저장
  async setTimerSession(userId: string, sessionData: any) {
    const redis = getRedis()
    const key = `timer:${userId}`
    const expiry = sessionData.targetMinutes * 60 + 300 // 타겟 시간 + 5분 버퍼
    
    const dataToStore = {
      ...sessionData,
      expectedEndTime: new Date(Date.now() + sessionData.targetMinutes * 60 * 1000).toISOString()
    }
    
    if (redis) {
      try {
        await redis.setex(key, expiry, JSON.stringify(dataToStore))
      } catch (error) {
        console.error('Redis setex error:', error)
        // Redis 실패 시 메모리 저장소 사용
        memoryStore.set(key, {
          data: dataToStore,
          expireAt: Date.now() + expiry * 1000
        })
      }
    } else {
      // Redis가 없으면 메모리 저장소 사용
      memoryStore.set(key, {
        data: dataToStore,
        expireAt: Date.now() + expiry * 1000
      })
    }
  },
  
  // 타이머 세션 조회
  async getTimerSession(userId: string) {
    const redis = getRedis()
    const key = `timer:${userId}`
    let data: string | null = null
    
    if (redis) {
      try {
        data = await redis.get(key)
      } catch (error) {
        console.error('Redis get error:', error)
        // Redis 실패 시 메모리 저장소에서 조회
        const memData = memoryStore.get(key)
        if (memData && memData.expireAt > Date.now()) {
          data = JSON.stringify(memData.data)
        } else if (memData) {
          memoryStore.delete(key)
        }
      }
    } else {
      // Redis가 없으면 메모리 저장소에서 조회
      const memData = memoryStore.get(key)
      if (memData && memData.expireAt > Date.now()) {
        data = JSON.stringify(memData.data)
      } else if (memData) {
        memoryStore.delete(key)
      }
    }
    
    if (!data) return null
    
    const session = JSON.parse(data)
    const now = new Date()
    const expectedEnd = new Date(session.expectedEndTime)
    
    // 타이머가 만료되었는지 체크
    if (now >= expectedEnd) {
      session.isExpired = true
      session.remainingSeconds = 0
    } else {
      session.isExpired = false
      session.remainingSeconds = Math.floor((expectedEnd.getTime() - now.getTime()) / 1000)
    }
    
    return session
  },
  
  // 타이머 세션 삭제
  async clearTimerSession(userId: string) {
    const redis = getRedis()
    const key = `timer:${userId}`
    
    if (redis) {
      try {
        await redis.del(key)
      } catch (error) {
        console.error('Redis del error:', error)
      }
    }
    
    // 메모리 저장소에서도 삭제
    memoryStore.delete(key)
  },
  
  // 모든 활성 타이머 조회 (관리자용)
  async getAllActiveTimers() {
    const timers = []
    const redis = getRedis()
    
    if (redis) {
      try {
        const keys = await redis.keys('timer:*')
        for (const key of keys) {
          const data = await redis.get(key)
          if (data) {
            const userId = key.split(':')[1]
            timers.push({
              userId,
              ...JSON.parse(data)
            })
          }
        }
      } catch (error) {
        console.error('Redis keys error:', error)
      }
    }
    
    // 메모리 저장소에서도 조회
    const now = Date.now()
    for (const [key, value] of memoryStore.entries()) {
      if (value.expireAt > now && key.startsWith('timer:')) {
        const userId = key.split(':')[1]
        timers.push({
          userId,
          ...value.data
        })
      }
    }
    
    return timers
  }
}