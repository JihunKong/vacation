# 완도고등학교 여름방학 성장 퀘스트 프로젝트

## 프로젝트 개요
- **프로젝트명**: 여름방학 성장 퀘스트
- **대상**: 완도고등학교 2학년 학생들
- **기간**: 2025년 7월 21일 ~ 8월 17일
- **목적**: 게이미피케이션을 통한 자기주도적 방학 계획 관리

## 기술 스택
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Railway)
- **ORM**: Prisma
- **Authentication**: NextAuth.js + Google OAuth
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: shadcn/ui
- **AI**: OpenAI API
- **Deployment**: Railway

## 주요 기능
1. **학생 기능**
   - Google 로그인
   - 일일 계획 수립 및 관리
   - 6개 카테고리별 활동 기록
   - 경험치 및 레벨 시스템
   - 리더보드
   - 주간/월간 통계

2. **교사 기능**
   - 전체 학생 통계 대시보드
   - AI 기반 활동 요약
   - 엑셀 데이터 내보내기

3. **게이미피케이션**
   - 경험치 시스템
   - 레벨업 애니메이션
   - 연속 달성 보너스
   - 카테고리별 뱃지

## 프로젝트 구조
```
summer-quest/
├── app/
│   ├── (auth)/
│   ├── (main)/
│   ├── (teacher)/
│   └── api/
├── components/
├── lib/
├── prisma/
├── public/
└── styles/
```

## 환경 변수 필요 항목
- DATABASE_URL (Railway PostgreSQL)
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- OPENAI_API_KEY

## 개발 진행 순서
1. 프로젝트 초기화 (01-initialize-project.md)
2. 데이터베이스 설정 (02-database-setup.md)
3. 인증 구현 (03-auth-setup.md)
4. 기본 UI 구축 (04-ui-setup.md)
5. API 엔드포인트 (05-api-endpoints.md)
6. 학생 기능 구현 (06-student-features.md)
7. 교사 기능 구현 (07-teacher-features.md)
8. AI 통합 (08-ai-integration.md)
9. 배포 설정 (09-deployment.md)