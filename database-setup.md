# 02. 데이터베이스 설정

## 1. Railway PostgreSQL 설정

### Railway 프로젝트 생성
1. [Railway](https://railway.app) 로그인
2. New Project 클릭
3. "Deploy PostgreSQL" 선택
4. Database 생성 완료 후 "Connect" 탭에서 DATABASE_URL 복사

### 환경 변수 설정
`.env.local` 파일에 DATABASE_URL 추가:
```
DATABASE_URL="postgresql://postgres:xxxxx@xxxxx.railway.app:xxxx/railway"
```

## 2. Prisma 초기화

```bash
# Prisma 초기화
npx prisma init

# 기존 schema.prisma 파일 삭제하고 새로 작성
rm prisma/schema.prisma
```

## 3. Prisma Schema 작성

`prisma/schema.prisma` 파일 생성:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth 관련 모델
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified DateTime?
  name          String?
  image         String?
  nickname      String?   @unique
  level         Int       @default(1)
  totalExp      Int       @default(0)
  role          Role      @default(STUDENT)
  classId       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  plans         Plan[]
  achievements  Achievement[]
  stats         UserStats?
  weeklyReports WeeklyReport[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// 앱 관련 모델
model Plan {
  id            String    @id @default(cuid())
  userId        String
  date          DateTime  @db.Date
  category      Category
  title         String
  description   String?
  targetTime    Int       // 분 단위
  actualTime    Int?      
  completed     Boolean   @default(false)
  completedAt   DateTime?
  exp           Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, date])
  @@index([category])
}

model UserStats {
  id            String    @id @default(cuid())
  userId        String    @unique
  studyTime     Int       @default(0)  // 총 학습 시간 (분)
  exerciseTime  Int       @default(0)  // 총 운동 시간 (분)
  readingTime   Int       @default(0)  // 총 독서 시간 (분)
  volunteerTime Int       @default(0)  // 총 봉사 시간 (분)
  hobbyTime     Int       @default(0)  // 총 취미 시간 (분)
  socialTime    Int       @default(0)  // 총 사회활동 시간 (분)
  currentStreak Int       @default(0)  // 현재 연속 일수
  bestStreak    Int       @default(0)  // 최고 연속 일수
  lastActiveDate DateTime?
  totalDays     Int       @default(0)  // 총 활동 일수
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Achievement {
  id            String    @id @default(cuid())
  userId        String
  type          AchievementType
  name          String
  description   String
  icon          String?
  unlockedAt    DateTime  @default(now())
  exp           Int       @default(0)
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, type])
  @@index([userId])
}

model WeeklyReport {
  id            String    @id @default(cuid())
  userId        String
  weekStart     DateTime  @db.Date
  weekEnd       DateTime  @db.Date
  summary       String    @db.Text  // AI가 생성한 요약
  highlights    Json?     // 주요 성과
  suggestions   Json?     // AI 제안사항
  totalExp      Int       @default(0)
  totalMinutes  Int       @default(0)
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, weekStart])
  @@index([userId])
}

model SystemConfig {
  id            String    @id @default(cuid())
  key           String    @unique
  value         Json
  updatedAt     DateTime  @updatedAt
}

// Enums
enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum Category {
  STUDY       // 학습
  EXERCISE    // 운동
  READING     // 독서
  VOLUNTEER   // 봉사
  HOBBY       // 취미
  SOCIAL      // 사회활동
}

enum AchievementType {
  FIRST_PLAN        // 첫 계획 수립
  FIRST_COMPLETE    // 첫 계획 완료
  STREAK_3          // 3일 연속
  STREAK_7          // 7일 연속
  STREAK_14         // 14일 연속
  STREAK_21         // 21일 연속
  LEVEL_5           // 레벨 5 달성
  LEVEL_10          // 레벨 10 달성
  LEVEL_20          // 레벨 20 달성
  BALANCED          // 모든 카테고리 활동
  EARLY_BIRD        // 새벽 활동 7일
  NIGHT_OWL         // 야간 활동 7일
  PERFECTIONIST     // 주간 100% 달성
  EXPLORER          // 모든 카테고리 10시간
}
```

## 4. Prisma Client 설정

`lib/db/prisma.ts` 파일 생성:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 5. 데이터베이스 마이그레이션

```bash
# 첫 마이그레이션 생성 및 적용
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

## 6. Seed 데이터 작성 (선택사항)

`prisma/seed.ts` 파일 생성:

```typescript
import { PrismaClient, Role, Category, AchievementType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 시스템 설정 초기화
  await prisma.systemConfig.upsert({
    where: { key: 'vacation_period' },
    update: {},
    create: {
      key: 'vacation_period',
      value: {
        start: '2025-07-21',
        end: '2025-08-17'
      }
    }
  })

  await prisma.systemConfig.upsert({
    where: { key: 'exp_settings' },
    update: {},
    create: {
      key: 'exp_settings',
      value: {
        daily_plan: 10,
        completion_80: 20,
        new_activity: 30,
        streak_5: 50,
        streak_10: 100,
        streak_20: 200,
        category_multipliers: {
          STUDY: 1.0,
          EXERCISE: 1.2,
          READING: 1.1,
          VOLUNTEER: 1.3,
          HOBBY: 1.1,
          SOCIAL: 1.0
        }
      }
    }
  })

  // 테스트용 교사 계정 (프로덕션에서는 제거)
  if (process.env.NODE_ENV === 'development') {
    await prisma.user.upsert({
      where: { email: 'teacher@wando.hs.kr' },
      update: {},
      create: {
        email: 'teacher@wando.hs.kr',
        name: '김선생',
        nickname: 'teacher',
        role: Role.TEACHER,
        emailVerified: new Date(),
      }
    })
  }

  console.log('Seed completed')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

`package.json`에 seed 스크립트 추가:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Seed 실행:
```bash
npm install -D ts-node @types/bcryptjs bcryptjs
npx prisma db seed
```

## 7. Prisma Studio로 데이터 확인

```bash
npx prisma studio
```

브라우저에서 http://localhost:5555 접속하여 데이터베이스 확인

## 8. 유틸리티 함수 작성

`lib/db/queries.ts` 파일 생성:

```typescript
import { prisma } from './prisma'
import { Category } from '@prisma/client'
import { startOfWeek, endOfWeek } from 'date-fns'

// 사용자 통계 업데이트
export async function updateUserStats(userId: string, category: Category, minutes: number) {
  const categoryTimeField = `${category.toLowerCase()}Time` as keyof typeof stats

  const stats = await prisma.userStats.upsert({
    where: { userId },
    update: {
      [categoryTimeField]: {
        increment: minutes
      },
      updatedAt: new Date()
    },
    create: {
      userId,
      [categoryTimeField]: minutes
    }
  })

  return stats
}

// 주간 리포트 가져오기
export async function getWeeklyReport(userId: string, date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

  return prisma.weeklyReport.findUnique({
    where: {
      userId_weekStart: {
        userId,
        weekStart
      }
    }
  })
}

// 레벨 계산
export function calculateLevel(exp: number): number {
  return Math.floor(Math.sqrt(exp / 100)) + 1
}

// 다음 레벨까지 필요한 경험치
export function expToNextLevel(currentExp: number): number {
  const currentLevel = calculateLevel(currentExp)
  const nextLevel = currentLevel + 1
  const nextLevelExp = Math.pow(nextLevel - 1, 2) * 100
  return nextLevelExp - currentExp
}
```

## 다음 단계
데이터베이스 설정이 완료되었습니다. 다음은 `03-auth-setup.md`를 참고하여 인증을 구현하세요.