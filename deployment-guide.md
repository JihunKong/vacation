# 09. Railway 배포 가이드

## 1. 프로젝트 준비

### package.json 스크립트 확인

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
```

### 환경 변수 준비

필요한 환경 변수 목록:
- `DATABASE_URL` (Railway PostgreSQL URL)
- `NEXTAUTH_URL` (배포된 도메인 URL)
- `NEXTAUTH_SECRET` (시크릿 키)
- `GOOGLE_CLIENT_ID` (Google OAuth)
- `GOOGLE_CLIENT_SECRET` (Google OAuth)
- `OPENAI_API_KEY` (OpenAI API)

## 2. GitHub 저장소 설정

```bash
# Git 초기화 (이미 했다면 스킵)
git init

# GitHub 저장소 생성 후 원격 저장소 추가
git remote add origin https://github.com/your-username/summer-quest.git

# 모든 파일 커밋
git add .
git commit -m "Initial deployment setup"

# main 브랜치로 푸시
git push -u origin main
```

## 3. Railway 프로젝트 생성

### Railway CLI 설치 (선택사항)

```bash
# macOS/Linux
brew install railway

# Windows (PowerShell)
iwr https://railway.app/install.ps1 -useb | iex
```

### Railway 대시보드에서 설정

1. [Railway](https://railway.app) 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. GitHub 저장소 연결 및 선택
5. 자동으로 빌드 시작

## 4. PostgreSQL 추가

Railway 프로젝트에서:
1. "New" → "Database" → "Add PostgreSQL" 클릭
2. PostgreSQL 인스턴스 생성 완료
3. "Connect" 탭에서 `DATABASE_URL` 복사

## 5. 환경 변수 설정

Railway 프로젝트 설정에서:
1. "Variables" 탭 클릭
2. 다음 환경 변수 추가:

```bash
DATABASE_URL=postgresql://...  # PostgreSQL에서 복사한 URL
NEXTAUTH_URL=https://your-app.up.railway.app  # Railway 제공 URL
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
```

## 6. 빌드 설정

`railway.json` 파일 생성:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
```

## 7. 헬스체크 엔드포인트 추가

`app/api/health/route.ts` 파일 생성:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "summer-quest"
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Database connection failed",
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
```

## 8. 커스텀 도메인 설정

### 도메인 구매 및 설정
1. 도메인 구매 (Cloudflare, Gabia, 등)
2. Railway 프로젝트의 "Settings" → "Domains" 이동
3. "Add Domain" 클릭
4. 커스텀 도메인 입력 (예: `summer-quest.school.kr`)

### DNS 설정
도메인 제공업체에서:
- CNAME 레코드 추가: `your-domain.com` → `your-app.up.railway.app`
- 또는 A 레코드 추가: Railway가 제공하는 IP 주소

### Google OAuth 리다이렉트 URI 업데이트
Google Cloud Console에서:
1. OAuth 2.0 클라이언트 ID 수정
2. 승인된 리다이렉트 URI에 추가:
   - `https://your-domain.com/api/auth/callback/google`

## 9. 프로덕션 최적화

### next.config.js 업데이트

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google 프로필 이미지
      'media.giphy.com', // GIF 이미지
    ],
  },
  // 프로덕션 최적화
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 데이터베이스 마이그레이션

```bash
# 로컬에서 마이그레이션 파일 생성
npx prisma migrate dev --name production_ready

# Git에 커밋
git add .
git commit -m "Add production migrations"
git push
```

Railway는 자동으로 마이그레이션을 실행합니다.

## 10. 모니터링 및 로깅

### Sentry 통합 (선택사항)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

`sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
})
```

### Railway 로그 확인

Railway CLI 사용:
```bash
railway logs
```

또는 Railway 대시보드에서 "Logs" 탭 확인

## 11. 크론잡 설정 (주간 리포트 자동 생성)

### Vercel Cron (대안)

`vercel.json` 파일 생성:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-reports",
      "schedule": "0 0 * * 1"
    }
  ]
}
```

`app/api/cron/weekly-reports/route.ts`:

```typescript
import { NextRequest } from "next/server"
import { headers } from "next/headers"
import { ApiResponse } from "@/lib/api/response"

export async function GET(req: NextRequest) {
  // Vercel Cron 인증
  const authHeader = headers().get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return ApiResponse.unauthorized()
  }

  try {
    // 주간 리포트 생성 API 호출
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/ai/generate-reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 내부 API 인증
        "x-api-key": process.env.INTERNAL_API_KEY!
      }
    })

    const result = await response.json()
    return ApiResponse.success(result)
  } catch (error) {
    return ApiResponse.serverError(error)
  }
}
```

## 12. 백업 전략

### 데이터베이스 백업

Railway PostgreSQL 자동 백업 기능 활용:
1. Railway 대시보드에서 PostgreSQL 서비스 선택
2. "Settings" → "Backups" 활성화
3. 일일 자동 백업 설정

### 수동 백업 스크립트

`scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="your-production-database-url"

# 데이터베이스 덤프
pg_dump $DATABASE_URL > backup_$DATE.sql

# S3 또는 다른 스토리지에 업로드
# aws s3 cp backup_$DATE.sql s3://your-bucket/backups/
```

## 13. 성능 최적화

### 이미지 최적화

```typescript
// next.config.js에 추가
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1년
  },
}
```

### API 캐싱

`app/api/stats/leaderboard/route.ts` 수정:

```typescript
export async function GET(req: NextRequest) {
  // 캐시 헤더 추가
  const headers = {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  }

  try {
    // ... 기존 코드

    return NextResponse.json(
      { success: true, data },
      { headers }
    )
  } catch (error) {
    // ... 에러 처리
  }
}
```

## 14. 보안 체크리스트

- [x] 환경 변수 안전하게 관리
- [x] HTTPS 강제 적용 (Railway 자동)
- [x] 보안 헤더 설정
- [x] SQL 인젝션 방지 (Prisma ORM)
- [x] XSS 방지 (React 자동)
- [x] CSRF 보호 (NextAuth)
- [x] Rate limiting 고려

### Rate Limiting 구현

`lib/rate-limit.ts`:

```typescript
import { LRUCache } from "lru-cache"

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit
        
        return isRateLimited ? reject() : resolve()
      }),
  }
}
```

## 15. 배포 후 체크리스트

### 즉시 확인
- [ ] 웹사이트 접속 확인
- [ ] Google 로그인 테스트
- [ ] 데이터베이스 연결 확인
- [ ] 기본 CRUD 동작 확인

### 기능 테스트
- [ ] 학생: 계획 생성/수정/완료
- [ ] 학생: 리더보드 확인
- [ ] 교사: 대시보드 접근
- [ ] 교사: 데이터 내보내기
- [ ] AI 리포트 생성

### 모니터링
- [ ] Railway 로그 확인
- [ ] 에러 발생 여부 모니터링
- [ ] 성능 메트릭 확인
- [ ] 데이터베이스 쿼리 성능

## 16. 트러블슈팅

### 빌드 실패
```bash
# Prisma 관련 에러
npm run postinstall

# 타입 에러
npm run lint
```

### 데이터베이스 연결 실패
- DATABASE_URL 환경 변수 확인
- Railway PostgreSQL 상태 확인
- 연결 문자열에 `?sslmode=require` 추가

### 이미지 로드 실패
- next.config.js의 이미지 도메인 확인
- CORS 정책 확인

## 17. 유지보수

### 정기 작업
- 주간: 로그 확인, 성능 모니터링
- 월간: 데이터베이스 백업 확인, 보안 업데이트
- 분기: 의존성 업데이트, 성능 최적화

### 업데이트 프로세스
```bash
# 로컬에서 업데이트
npm update
npm run build
npm run lint

# 테스트 후 배포
git add .
git commit -m "Update dependencies"
git push
```

Railway는 자동으로 재배포합니다.

## 완료!

축하합니다! 여름방학 성장 퀘스트가 성공적으로 배포되었습니다. 🎉

### 다음 단계 제안
1. 사용자 피드백 수집 시스템 구축
2. 추가 게이미피케이션 요소 도입
3. 모바일 앱 개발 고려
4. 실시간 알림 기능 추가
5. 더 상세한 분석 대시보드 구현