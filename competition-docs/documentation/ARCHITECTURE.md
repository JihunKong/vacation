# 🏗️ Study Log 시스템 아키텍처

## 📐 전체 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Next.js App (React Components)              │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │  Pages   │ │   UI     │ │  Hooks   │           │    │
│  │  │          │ │Components│ │          │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/HTTPS
┌───────────────────────┴─────────────────────────────────────┐
│                    Next.js Server                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              API Routes (Backend)                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │   Auth   │ │Activities│ │  Plans   │           │    │
│  │  │          │ │          │ │          │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Middleware & Services                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │NextAuth  │ │  Prisma  │ │  Game    │           │    │
│  │  │          │ │   ORM    │ │  Logic   │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │ SQL
┌───────────────────────┴─────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   Tables: User, StudentProfile, Activity, Plan,      │    │
│  │   PlanItem, Badge, Summary                          │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## 🗂️ 프로젝트 구조

```
vacation/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # 인증 관련 페이지
│   │   └── auth/signin/     # 로그인 페이지
│   ├── (main)/              # 메인 레이아웃
│   │   └── dashboard/       # 대시보드 관련 페이지
│   │       ├── page.tsx     # 대시보드 메인
│   │       ├── activities/  # 활동 기록
│   │       ├── plan/        # 계획 수립
│   │       ├── stats/       # 통계
│   │       └── leaderboard/ # 리더보드
│   ├── api/                 # API 엔드포인트
│   │   ├── auth/           # 인증 API
│   │   ├── activities/     # 활동 API
│   │   └── plans/          # 계획 API
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 홈페이지
├── components/             # React 컴포넌트
│   ├── ui/                # 기본 UI 컴포넌트
│   ├── activities/        # 활동 관련 컴포넌트
│   ├── avatar/           # 아바타 컴포넌트
│   ├── plan/             # 계획 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── auth.ts           # NextAuth 설정
│   ├── db.ts             # Prisma 클라이언트
│   ├── game/             # 게임 로직
│   │   ├── stats.ts      # XP/레벨 계산
│   │   └── badges.ts     # 배지 시스템
│   └── utils.ts          # 유틸리티 함수
├── prisma/               # 데이터베이스
│   └── schema.prisma    # 데이터베이스 스키마
├── public/              # 정적 파일
└── scripts/             # 유틸리티 스크립트
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블 구조

#### User (사용자)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  name          String?
  role          Role      @default(STUDENT)
  studentProfile StudentProfile?
}
```

#### StudentProfile (학생 프로필)
```prisma
model StudentProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  level           Int       @default(1)
  experience      Int       @default(0)
  totalXP         Int       @default(0)
  strength        Int       @default(10)
  intelligence    Int       @default(10)
  dexterity       Int       @default(10)
  charisma        Int       @default(10)
  vitality        Int       @default(10)
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  totalMinutes    Int       @default(0)
}
```

#### Activity (활동 기록)
```prisma
model Activity {
  id              String    @id @default(cuid())
  studentId       String
  title           String
  description     String?
  category        Category
  minutes         Int
  date            DateTime  @db.Date
  xpEarned        Int
  statPoints      Json
}
```

#### Plan & PlanItem (계획)
```prisma
model Plan {
  id              String    @id @default(cuid())
  studentId       String
  date            DateTime  @db.Date
  items           PlanItem[]
  isCompleted     Boolean   @default(false)
}

model PlanItem {
  id              String    @id @default(cuid())
  planId          String
  title           String
  category        Category
  targetMinutes   Int
  isCompleted     Boolean   @default(false)
}
```

#### Badge (배지)
```prisma
model Badge {
  id              String    @id @default(cuid())
  studentId       String
  type            BadgeType
  tier            Int       @default(1)
  earnedAt        DateTime  @default(now())
}
```

### 데이터 관계
- User ↔ StudentProfile: 1:1 관계
- StudentProfile ↔ Activity: 1:N 관계
- StudentProfile ↔ Plan: 1:N 관계
- Plan ↔ PlanItem: 1:N 관계
- StudentProfile ↔ Badge: 1:N 관계

## 🔄 데이터 플로우

### 1. 사용자 인증 플로우
```
사용자 로그인 요청
    ↓
NextAuth 처리
    ↓
세션 생성
    ↓
JWT 토큰 발급
    ↓
클라이언트 저장
```

### 2. 활동 기록 플로우
```
활동 입력 (클라이언트)
    ↓
입력 검증 (10-60분)
    ↓
API 요청 (/api/activities)
    ↓
서버 검증
    ↓
XP 계산
    ↓
능력치 계산
    ↓
데이터베이스 저장
    ↓
레벨업 확인
    ↓
배지 획득 확인
    ↓
응답 반환
```

### 3. 리더보드 업데이트 플로우
```
활동 기록 완료
    ↓
프로필 업데이트
    ↓
리더보드 쿼리
    ↓
상위 20명 정렬
    ↓
캐시 업데이트
    ↓
클라이언트 반영
```

## 🔌 API 엔드포인트

### 인증 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/signin | 로그인 |
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/signout | 로그아웃 |
| GET | /api/auth/session | 세션 확인 |

### 활동 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/activities | 활동 목록 조회 |
| POST | /api/activities | 활동 기록 생성 |
| PUT | /api/activities/:id | 활동 수정 |
| DELETE | /api/activities/:id | 활동 삭제 |

### 계획 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/plans | 계획 목록 조회 |
| POST | /api/plans | 계획 생성 |
| PUT | /api/plans/:id | 계획 수정 |
| DELETE | /api/plans/:id | 계획 삭제 |

## 🎮 게임 로직 시스템

### XP 계산 알고리즘
```typescript
function calculateXP(minutes: number, category: Category, hasStreak: boolean): number {
  const baseXP = Math.floor(minutes / 10) * 10
  const categoryWeight = CATEGORY_XP_WEIGHT[category]
  const streakBonus = hasStreak ? 1.2 : 1.0
  
  return Math.floor(baseXP * categoryWeight * streakBonus)
}
```

### 레벨 계산 알고리즘
```typescript
function calculateLevel(totalXP: number): { level: number; currentXP: number; requiredXP: number } {
  let level = 1
  let remainingXP = totalXP
  
  while (remainingXP >= getRequiredXP(level)) {
    remainingXP -= getRequiredXP(level)
    level++
    if (level >= 100) break
  }
  
  return { level, currentXP: remainingXP, requiredXP: getRequiredXP(level) }
}
```

### 능력치 계산
```typescript
function calculateStatPoints(xp: number): number {
  return Math.floor(xp / 10)
}
```

## 🔐 보안 아키텍처

### 인증 & 인가
- **NextAuth.js**: OAuth 2.0 표준 구현
- **JWT 토큰**: 안전한 세션 관리
- **bcrypt**: 비밀번호 해싱
- **HTTPS**: 모든 통신 암호화

### 입력 검증
```
클라이언트 검증 (HTML5)
    ↓
API 레벨 검증 (Zod/Yup)
    ↓
비즈니스 로직 검증
    ↓
데이터베이스 제약조건
```

### 데이터 보호
- SQL Injection 방지: Prisma ORM 파라미터화 쿼리
- XSS 방지: React 자동 이스케이핑
- CSRF 보호: NextAuth CSRF 토큰
- Rate Limiting: API 요청 제한

## 🚀 배포 아키텍처

### Railway 플랫폼
```
GitHub Repository
    ↓
Railway Auto Deploy
    ↓
Build Process
    ↓
Docker Container
    ↓
Production Server
```

### 환경 구성
- **Production**: https://vacation-production-f151.up.railway.app
- **Database**: PostgreSQL on Railway
- **환경 변수**: Railway 환경 변수 관리

### 확장성
- 수평 확장: Railway 자동 스케일링
- 데이터베이스 풀링: Prisma 연결 풀
- CDN: 정적 자산 캐싱
- 로드 밸런싱: Railway 내장

## 📊 모니터링 & 로깅

### 에러 추적
- Console 로깅
- Railway 로그 수집
- 에러 경계 컴포넌트

### 성능 모니터링
- Core Web Vitals
- API 응답 시간
- 데이터베이스 쿼리 성능

### 분석
- 사용자 활동 패턴
- 인기 기능 추적
- 성장 지표 모니터링

## 🔧 개발 도구

### 필수 도구
- Node.js 18+
- npm/yarn
- PostgreSQL 14+
- Git

### 개발 환경
- VS Code
- Prisma Studio
- Postman/Insomnia
- React DevTools

### 테스팅
- Jest: 단위 테스트
- Playwright: E2E 테스트
- React Testing Library: 컴포넌트 테스트

## 📈 성능 최적화

### 프론트엔드
- 코드 스플리팅
- 이미지 최적화
- 번들 크기 최소화
- 지연 로딩

### 백엔드
- 쿼리 최적화
- 인덱싱
- 캐싱 전략
- 연결 풀링

### 네트워크
- HTTP/2
- Gzip 압축
- 브라우저 캐싱
- CDN 활용