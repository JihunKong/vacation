# 금성고등학교 여름방학 퀘스트 배포 가이드

## 📋 전체 프로세스 개요

1. GitHub 리포지토리 fork 또는 복사
2. 학교 정보 변경
3. Railway 새 프로젝트 생성
4. 데이터베이스 설정
5. 배포 및 테스트

## 🚀 단계별 가이드

### 1단계: GitHub 리포지토리 준비

#### 옵션 A: Fork 사용 (권장)
1. https://github.com/JihunKong/vacation 접속
2. 우측 상단 **Fork** 버튼 클릭
3. 리포지토리 이름을 `geumseong-vacation` 으로 변경
4. **Create fork** 클릭

#### 옵션 B: 새 리포지토리 생성
```bash
# 로컬에 클론
git clone https://github.com/JihunKong/vacation.git geumseong-vacation
cd geumseong-vacation

# 기존 원격 저장소 제거
git remote remove origin

# 새 리포지토리 연결
git remote add origin https://github.com/YOUR_USERNAME/geumseong-vacation.git
```

### 2단계: 학교 정보 변경

#### 변경해야 할 파일들:

**1. `app/page.tsx`**
```typescript
// 10번째 줄 근처
<h1 className="text-4xl font-bold mb-4">
  금성고등학교 여름방학 퀘스트 🏝️
</h1>
```

**2. `app/auth/signin/page.tsx`**
```typescript
// 제목 변경
<h1 className="text-2xl font-bold mb-2">금성고 여름방학 퀘스트</h1>
```

**3. `components/layout/dashboard-nav.tsx`**
```typescript
// 46번째 줄 근처
<Link href="/dashboard" className="text-xl font-bold">
  🏝️ 금성고 여름방학 퀘스트
</Link>
```

**4. `CLAUDE.md`**
```markdown
# 첫 부분 수정
This is a gamified summer vacation planning and tracking system for Geumseong High School 2nd-year students...
```

**5. `package.json`**
```json
{
  "name": "geumseong-vacation",
  "version": "1.0.0",
  // ...
}
```

### 3단계: Railway 프로젝트 생성

1. [Railway](https://railway.app) 로그인
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. `geumseong-vacation` 리포지토리 선택

### 4단계: PostgreSQL 데이터베이스 추가

1. Railway 프로젝트 대시보드에서 **New** 클릭
2. **Database** → **PostgreSQL** 선택
3. PostgreSQL 서비스가 추가되면 클릭
4. **Variables** 탭에서 `DATABASE_URL` 복사

### 5단계: 환경변수 설정

앱 서비스의 **Variables** 탭에서 추가:

```env
# 필수 환경변수
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_URL=https://YOUR-APP-NAME.up.railway.app
NEXTAUTH_SECRET=YOUR_SECRET_HERE

# OpenAI API (교사 기능용 - 선택사항)
OPENAI_API_KEY=your-api-key
```

**NEXTAUTH_SECRET 생성:**
```bash
openssl rand -base64 32
```

### 6단계: 데이터베이스 초기화

배포 완료 후, Railway Shell에서:

```bash
# Railway Shell 접속
# 프로젝트 대시보드 → 앱 서비스 → ⋮ 메뉴 → Railway Shell

# 데이터베이스 테이블 생성
npm run db:push
```

또는 로컬에서:
```bash
# Railway CLI 설치 (아직 없다면)
npm install -g @railway/cli

# 프로젝트 연결
railway link

# 앱 서비스 선택
railway service

# 데이터베이스 초기화
railway run npm run db:push
```

### 7단계: 도메인 설정 (선택사항)

1. Railway 앱 서비스 → **Settings** 탭
2. **Domains** 섹션
3. **Generate Domain** 또는 **Add Custom Domain**

## 🎨 추가 커스터마이징 (선택사항)

### 색상 테마 변경
`app/globals.css`에서 색상 변경:
```css
:root {
  --primary: 220 90% 56%;  /* 금성고 대표색으로 변경 */
}
```

### 로고/아이콘 변경
- `app/icon.png` 교체
- 이모지 변경: 🏝️ → 🌟 (또는 원하는 이모지)

### 방학 기간 변경
`lib/constants/index.ts`:
```typescript
export const VACATION_START = new Date('2025-07-21')
export const VACATION_END = new Date('2025-08-17')
```

## 📝 체크리스트

- [ ] GitHub 리포지토리 생성/Fork
- [ ] 학교명 변경 (5개 파일)
- [ ] Railway 프로젝트 생성
- [ ] PostgreSQL 추가
- [ ] 환경변수 설정
- [ ] 데이터베이스 초기화
- [ ] 첫 배포 확인
- [ ] 테스트 계정으로 로그인 테스트

## 🆘 문제 해결

### 빌드 실패
- Node.js 버전 확인 (18 이상)
- 환경변수 확인

### 데이터베이스 연결 실패
- DATABASE_URL이 올바른지 확인
- PostgreSQL 서비스가 실행 중인지 확인

### 로그인 불가
- NEXTAUTH_URL이 실제 배포 URL과 일치하는지 확인
- NEXTAUTH_SECRET이 설정되었는지 확인

## 🎉 완료!

모든 단계를 완료하면 금성고등학교 학생들을 위한 여름방학 퀘스트가 준비됩니다!

배포 URL: `https://YOUR-APP-NAME.up.railway.app`