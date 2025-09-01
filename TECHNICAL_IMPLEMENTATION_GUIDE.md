# Technical Implementation Guide

## Phase 1: Core Study Tools Implementation

### 1. Pomodoro Timer Implementation

#### Backend API Routes
```typescript
// app/api/pomodoro/route.ts
POST   /api/pomodoro/start    - Start new session
PUT    /api/pomodoro/pause    - Pause current session  
PUT    /api/pomodoro/resume   - Resume paused session
POST   /api/pomodoro/complete - Complete session & award XP
GET    /api/pomodoro/current  - Get active session
GET    /api/pomodoro/settings - Get user preferences
PUT    /api/pomodoro/settings - Update preferences
```

#### Database Schema Updates
```sql
-- Add to prisma/schema.prisma
model PomodoroSession {
  id            String    @id @default(cuid())
  studentId     String
  student       StudentProfile @relation(fields: [studentId], references: [id])
  
  startTime     DateTime
  endTime       DateTime?
  pausedAt      DateTime?
  totalPaused   Int      @default(0) // seconds
  
  duration      Int      @default(25) // minutes
  breakDuration Int      @default(5)  // minutes
  cycles        Int      @default(1)
  currentCycle  Int      @default(1)
  
  category      Category
  title         String?
  
  completed     Boolean  @default(false)
  activityId    String?
  activity      Activity? @relation(fields: [activityId], references: [id])
  
  xpEarned      Int      @default(0)
  bonusXp       Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model PomodoroSettings {
  id            String    @id @default(cuid())
  studentId     String    @unique
  student       StudentProfile @relation(fields: [studentId], references: [id])
  
  defaultDuration      Int      @default(25)
  defaultBreak        Int      @default(5)
  longBreakDuration   Int      @default(15)
  cyclesBeforeLongBreak Int    @default(4)
  
  soundEnabled        Boolean  @default(true)
  soundVolume         Int      @default(50)
  tickingSound        Boolean  @default(false)
  
  autoStartBreaks     Boolean  @default(true)
  autoStartPomodoros  Boolean  @default(false)
  
  theme              String   @default("forest") // forest, ocean, space, minimal
  
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

#### Frontend Components Structure
```typescript
// components/pomodoro/
├── PomodoroTimer.tsx       // Main timer component
├── TimerDisplay.tsx        // Visual timer circle
├── TimerControls.tsx       // Start/pause/stop buttons
├── TimerSettings.tsx       // Settings modal
├── SessionHistory.tsx      // Past sessions list
├── FocusAnimation.tsx      // Growing tree/plant animation
└── hooks/
    ├── usePomodoro.ts      // Timer logic hook
    ├── useSound.ts         // Audio effects
    └── useBackgroundSync.ts // Service worker sync
```

#### Real-time Timer Sync
```typescript
// lib/pomodoro/timer-sync.ts
import { io, Socket } from 'socket.io-client'

class PomodoroSync {
  private socket: Socket | null = null
  private sessionId: string | null = null
  
  connect(userId: string) {
    this.socket = io('/pomodoro', {
      auth: { userId }
    })
    
    this.socket.on('timer:update', this.handleTimerUpdate)
    this.socket.on('timer:complete', this.handleComplete)
  }
  
  startSession(config: PomodoroConfig) {
    this.socket?.emit('session:start', config)
  }
  
  pauseSession() {
    this.socket?.emit('session:pause')
  }
  
  private handleTimerUpdate = (data: TimerState) => {
    // Update UI with server state
    eventBus.emit('timer:tick', data)
  }
}
```

### 2. Achievement System Implementation

#### Achievement Engine
```typescript
// lib/achievements/achievement-engine.ts
interface AchievementCriteria {
  type: 'count' | 'streak' | 'total' | 'milestone'
  field: string
  operator: '>' | '>=' | '=' | '<' | '<='
  value: number
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time'
}

class AchievementEngine {
  async checkAchievements(userId: string, trigger: string) {
    // Get relevant achievements for trigger
    const achievements = await prisma.achievement.findMany({
      where: {
        triggers: { has: trigger },
        NOT: {
          userAchievements: {
            some: {
              studentId: userId,
              unlockedAt: { not: null }
            }
          }
        }
      }
    })
    
    for (const achievement of achievements) {
      const progress = await this.calculateProgress(userId, achievement)
      
      if (progress >= 100) {
        await this.unlockAchievement(userId, achievement.id)
      } else {
        await this.updateProgress(userId, achievement.id, progress)
      }
    }
  }
  
  private async calculateProgress(
    userId: string, 
    achievement: Achievement
  ): Promise<number> {
    const criteria = achievement.criteria as AchievementCriteria
    
    switch (criteria.type) {
      case 'count':
        return this.calculateCountProgress(userId, criteria)
      case 'streak':
        return this.calculateStreakProgress(userId, criteria)
      case 'total':
        return this.calculateTotalProgress(userId, criteria)
      case 'milestone':
        return this.calculateMilestoneProgress(userId, criteria)
    }
  }
}
```

#### Achievement Definitions
```typescript
// data/achievements.ts
export const achievements = [
  // Streak Achievements
  {
    code: 'STREAK_7',
    name: '일주일 연속 학습',
    description: '7일 연속으로 학습 활동을 기록하세요',
    category: 'streak',
    tier: 1,
    criteria: {
      type: 'streak',
      field: 'currentStreak',
      operator: '>=',
      value: 7
    },
    xpReward: 500,
    iconUrl: '/achievements/streak-7.png'
  },
  
  // Category Achievements
  {
    code: 'STUDY_100H',
    name: '학습의 달인',
    description: '총 100시간 학습 달성',
    category: 'study',
    tier: 3,
    criteria: {
      type: 'total',
      field: 'studyMinutes',
      operator: '>=',
      value: 6000
    },
    xpReward: 2000,
    iconUrl: '/achievements/study-master.png'
  },
  
  // Pomodoro Achievements
  {
    code: 'POMODORO_WARRIOR',
    name: '뽀모도로 전사',
    description: '하루에 10개의 뽀모도로 완료',
    category: 'pomodoro',
    tier: 2,
    criteria: {
      type: 'count',
      field: 'pomodoroSessions',
      operator: '>=',
      value: 10,
      timeframe: 'daily'
    },
    xpReward: 300,
    iconUrl: '/achievements/pomodoro-warrior.png'
  }
]
```

### 3. Growth Visualization Implementation

#### Data Aggregation Service
```typescript
// lib/analytics/data-aggregator.ts
class DataAggregator {
  async getDailyStats(userId: string, days: number = 30) {
    const startDate = subDays(new Date(), days)
    
    const activities = await prisma.activity.groupBy({
      by: ['date', 'category'],
      where: {
        studentId: userId,
        date: { gte: startDate }
      },
      _sum: {
        minutes: true,
        xpEarned: true
      }
    })
    
    return this.formatHeatmapData(activities)
  }
  
  async getCategoryBreakdown(userId: string, period: Period) {
    const { start, end } = this.getPeriodDates(period)
    
    const breakdown = await prisma.activity.groupBy({
      by: ['category'],
      where: {
        studentId: userId,
        date: { gte: start, lte: end }
      },
      _sum: {
        minutes: true
      },
      _count: true
    })
    
    return breakdown.map(item => ({
      category: item.category,
      minutes: item._sum.minutes || 0,
      sessions: item._count,
      percentage: (item._sum.minutes || 0) / totalMinutes * 100
    }))
  }
  
  async getStudyPatterns(userId: string) {
    // Analyze best study hours, peak days, etc.
    const activities = await prisma.activity.findMany({
      where: { studentId: userId },
      select: {
        createdAt: true,
        minutes: true,
        category: true
      }
    })
    
    return {
      peakHours: this.findPeakHours(activities),
      bestDays: this.findBestDays(activities),
      averageSession: this.calculateAverageSession(activities),
      consistency: this.calculateConsistency(activities)
    }
  }
}
```

#### Chart Components
```typescript
// components/charts/ActivityHeatmap.tsx
import { ResponsiveCalendar } from '@nivo/calendar'

export function ActivityHeatmap({ data }: { data: HeatmapData[] }) {
  return (
    <ResponsiveCalendar
      data={data}
      from={subMonths(new Date(), 3)}
      to={new Date()}
      emptyColor="#eeeeee"
      colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
      margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
      yearSpacing={40}
      monthBorderColor="#ffffff"
      dayBorderWidth={2}
      dayBorderColor="#ffffff"
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'row',
          translateY: 36,
          itemCount: 4,
          itemWidth: 42,
          itemHeight: 36,
          itemsSpacing: 14,
          itemDirection: 'right-to-left'
        }
      ]}
    />
  )
}
```

## Phase 2: Competitive Elements Implementation

### 1. Redis Integration

#### Redis Configuration
```typescript
// lib/redis/client.ts
import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000)
})

export class LeaderboardService {
  private readonly KEY_PREFIX = 'leaderboard'
  
  async updateScore(
    userId: string, 
    score: number, 
    period: 'daily' | 'weekly' | 'monthly'
  ) {
    const key = this.getKey(period)
    await redis.zadd(key, score, userId)
    
    // Set TTL based on period
    const ttl = this.getTTL(period)
    await redis.expire(key, ttl)
  }
  
  async getRankings(
    period: 'daily' | 'weekly' | 'monthly',
    limit: number = 100,
    offset: number = 0
  ) {
    const key = this.getKey(period)
    
    // Get rankings with scores
    const rankings = await redis.zrevrange(
      key, 
      offset, 
      offset + limit - 1,
      'WITHSCORES'
    )
    
    return this.formatRankings(rankings)
  }
  
  async getUserRank(userId: string, period: Period) {
    const key = this.getKey(period)
    const rank = await redis.zrevrank(key, userId)
    const score = await redis.zscore(key, userId)
    
    return {
      rank: rank !== null ? rank + 1 : null,
      score: score ? parseFloat(score) : 0
    }
  }
  
  private getKey(period: Period): string {
    const date = new Date()
    switch (period) {
      case 'daily':
        return `${this.KEY_PREFIX}:daily:${format(date, 'yyyy-MM-dd')}`
      case 'weekly':
        return `${this.KEY_PREFIX}:weekly:${format(date, 'yyyy-ww')}`
      case 'monthly':
        return `${this.KEY_PREFIX}:monthly:${format(date, 'yyyy-MM')}`
    }
  }
}
```

#### WebSocket for Live Updates
```typescript
// lib/websocket/leaderboard-socket.ts
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'

export function setupLeaderboardSocket(io: Server) {
  const leaderboardNamespace = io.of('/leaderboard')
  
  // Redis adapter for scaling
  const pubClient = redis.duplicate()
  const subClient = redis.duplicate()
  leaderboardNamespace.adapter(createAdapter(pubClient, subClient))
  
  leaderboardNamespace.on('connection', (socket) => {
    socket.on('subscribe', async (period: Period) => {
      socket.join(`leaderboard:${period}`)
      
      // Send initial rankings
      const rankings = await leaderboardService.getRankings(period)
      socket.emit('rankings:update', rankings)
    })
    
    socket.on('unsubscribe', (period: Period) => {
      socket.leave(`leaderboard:${period}`)
    })
  })
  
  // Broadcast updates when scores change
  eventBus.on('score:updated', async ({ userId, period }) => {
    const rankings = await leaderboardService.getRankings(period, 20)
    leaderboardNamespace
      .to(`leaderboard:${period}`)
      .emit('rankings:update', rankings)
  })
}
```

### 2. Friend System Implementation

#### Friend Management API
```typescript
// app/api/friends/route.ts
export async function POST(request: Request) {
  const { friendEmail } = await request.json()
  const session = await getServerSession(authOptions)
  
  // Find friend user
  const friend = await prisma.user.findUnique({
    where: { email: friendEmail }
  })
  
  if (!friend) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }
  
  // Create friend request
  const friendship = await prisma.friendship.create({
    data: {
      userId: session.user.id,
      friendId: friend.id,
      status: 'pending'
    }
  })
  
  // Send notification
  await notificationService.send(friend.id, {
    type: 'friend_request',
    from: session.user.name,
    friendshipId: friendship.id
  })
  
  return NextResponse.json(friendship)
}
```

## Phase 3: Social Learning Implementation

### 1. Study Groups

#### Group Management
```typescript
// lib/groups/group-manager.ts
class GroupManager {
  async createGroup(data: CreateGroupData, creatorId: string) {
    const group = await prisma.$transaction(async (tx) => {
      // Create group
      const group = await tx.studyGroup.create({
        data: {
          name: data.name,
          description: data.description,
          leaderId: creatorId,
          category: data.category,
          maxMembers: data.maxMembers || 8,
          isPublic: data.isPublic ?? true
        }
      })
      
      // Add creator as member
      await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId: creatorId,
          role: 'leader',
          joinedAt: new Date()
        }
      })
      
      return group
    })
    
    // Initialize group chat room
    await chatService.createRoom(`group:${group.id}`)
    
    return group
  }
  
  async joinGroup(groupId: string, userId: string) {
    // Check if group is full
    const memberCount = await prisma.groupMember.count({
      where: { groupId }
    })
    
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId }
    })
    
    if (memberCount >= group.maxMembers) {
      throw new Error('Group is full')
    }
    
    // Add member
    const member = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: 'member',
        joinedAt: new Date()
      }
    })
    
    // Notify group
    await this.notifyGroup(groupId, {
      type: 'member_joined',
      userId,
      timestamp: new Date()
    })
    
    return member
  }
}
```

#### Virtual Study Room
```typescript
// components/study-room/VirtualStudyRoom.tsx
export function VirtualStudyRoom({ groupId }: { groupId: string }) {
  const [members, setMembers] = useState<StudyMember[]>([])
  const [activePomodoros, setActivePomodoros] = useState<Map<string, PomodoroState>>()
  
  useEffect(() => {
    const socket = io('/study-room', {
      query: { groupId }
    })
    
    socket.on('members:update', setMembers)
    socket.on('pomodoro:update', (userId: string, state: PomodoroState) => {
      setActivePomodoros(prev => new Map(prev).set(userId, state))
    })
    
    return () => socket.disconnect()
  }, [groupId])
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {members.map(member => (
        <MemberCard
          key={member.id}
          member={member}
          pomodoroState={activePomodoros.get(member.userId)}
        />
      ))}
    </div>
  )
}
```

### 2. Challenge System

#### Challenge Engine
```typescript
// lib/challenges/challenge-engine.ts
class ChallengeEngine {
  async createChallenge(data: CreateChallengeData) {
    const challenge = await prisma.challenge.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type, // 'individual' | 'group' | 'school'
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        goal: data.goal, // e.g., { minutes: 600, category: 'STUDY' }
        rewards: data.rewards, // { xp: 1000, badge: 'challenge_winner' }
        maxParticipants: data.maxParticipants
      }
    })
    
    // Schedule start and end jobs
    await jobQueue.schedule('challenge:start', challenge.startDate, {
      challengeId: challenge.id
    })
    
    await jobQueue.schedule('challenge:end', challenge.endDate, {
      challengeId: challenge.id
    })
    
    return challenge
  }
  
  async joinChallenge(challengeId: string, userId: string) {
    // Check eligibility
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { _count: { select: { participants: true } } }
    })
    
    if (challenge._count.participants >= challenge.maxParticipants) {
      throw new Error('Challenge is full')
    }
    
    // Register participant
    const participant = await prisma.challengeParticipant.create({
      data: {
        challengeId,
        userId,
        progress: 0,
        joinedAt: new Date()
      }
    })
    
    return participant
  }
  
  async updateProgress(challengeId: string, userId: string, progress: number) {
    const participant = await prisma.challengeParticipant.update({
      where: {
        challengeId_userId: {
          challengeId,
          userId
        }
      },
      data: {
        progress,
        lastUpdate: new Date()
      }
    })
    
    // Check if goal reached
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    })
    
    if (progress >= challenge.goal.value) {
      await this.awardRewards(userId, challenge.rewards)
    }
    
    return participant
  }
}
```

## Performance Optimization

### Database Indexes
```sql
-- Add indexes for common queries
CREATE INDEX idx_activities_student_date ON activities(student_id, date DESC);
CREATE INDEX idx_pomodoro_student_created ON pomodoro_sessions(student_id, created_at DESC);
CREATE INDEX idx_friendship_user ON friendships(user_id, status);
CREATE INDEX idx_group_member ON group_members(group_id, user_id);
CREATE INDEX idx_achievement_student ON user_achievements(student_id, unlocked_at);
```

### Caching Strategy
```typescript
// lib/cache/cache-manager.ts
class CacheManager {
  // User stats cache (1 hour TTL)
  async getUserStats(userId: string) {
    const key = `stats:${userId}`
    const cached = await redis.get(key)
    
    if (cached) return JSON.parse(cached)
    
    const stats = await this.calculateUserStats(userId)
    await redis.setex(key, 3600, JSON.stringify(stats))
    
    return stats
  }
  
  // Achievement progress cache (15 minutes TTL)
  async getAchievementProgress(userId: string) {
    const key = `achievements:${userId}`
    const cached = await redis.get(key)
    
    if (cached) return JSON.parse(cached)
    
    const progress = await this.calculateAchievementProgress(userId)
    await redis.setex(key, 900, JSON.stringify(progress))
    
    return progress
  }
  
  // Invalidate on updates
  async invalidateUserCache(userId: string) {
    const keys = [
      `stats:${userId}`,
      `achievements:${userId}`,
      `profile:${userId}`
    ]
    
    await redis.del(...keys)
  }
}
```

## Monitoring & Analytics

### Event Tracking
```typescript
// lib/analytics/tracker.ts
class EventTracker {
  track(event: string, properties: Record<string, any>) {
    // Send to analytics service
    analytics.track({
      event,
      properties: {
        ...properties,
        timestamp: new Date(),
        sessionId: getSessionId(),
        userId: getUserId()
      }
    })
    
    // Log for internal metrics
    logger.info('Event tracked', { event, properties })
  }
}

// Usage
tracker.track('pomodoro_completed', {
  duration: 25,
  category: 'STUDY',
  xpEarned: 50
})
```

### Performance Monitoring
```typescript
// middleware/performance.ts
export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    metrics.histogram('http_request_duration', duration, {
      method: req.method,
      route: req.route?.path,
      status: res.statusCode
    })
    
    if (duration > 1000) {
      logger.warn('Slow request', {
        method: req.method,
        url: req.url,
        duration
      })
    }
  })
  
  next()
}
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/pomodoro.test.ts
describe('PomodoroTimer', () => {
  it('should complete session and award XP', async () => {
    const session = await pomodoroService.startSession({
      userId: 'test-user',
      duration: 25,
      category: 'STUDY'
    })
    
    // Fast-forward time
    jest.advanceTimersByTime(25 * 60 * 1000)
    
    const completed = await pomodoroService.completeSession(session.id)
    
    expect(completed.completed).toBe(true)
    expect(completed.xpEarned).toBeGreaterThan(0)
  })
})
```

### Integration Tests
```typescript
// __tests__/integration/leaderboard.test.ts
describe('Leaderboard Integration', () => {
  it('should update rankings in real-time', async () => {
    // Create test users
    const users = await createTestUsers(5)
    
    // Submit activities
    for (const user of users) {
      await submitActivity(user.id, {
        category: 'STUDY',
        minutes: Math.random() * 100
      })
    }
    
    // Check leaderboard
    const rankings = await leaderboardService.getRankings('daily')
    
    expect(rankings).toHaveLength(5)
    expect(rankings[0].score).toBeGreaterThan(rankings[1].score)
  })
})
```

## Deployment Checklist

- [ ] Database migrations ready
- [ ] Redis cluster configured
- [ ] WebSocket server deployed
- [ ] Environment variables set
- [ ] Feature flags configured
- [ ] Monitoring dashboards created
- [ ] Load testing completed
- [ ] Rollback plan documented
- [ ] User documentation updated
- [ ] Support team briefed