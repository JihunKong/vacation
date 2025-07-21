# 🚀 빠른 복제 가이드 - 다른 학교용 버전 만들기

## 5분 만에 완료하는 방법

### 1. Fork & Clone (1분)
```bash
# GitHub에서 Fork 후
git clone https://github.com/YOUR_USERNAME/geumseong-vacation.git
cd geumseong-vacation
```

### 2. 학교명 자동 변경 (30초)
```bash
# 학교명 변경 스크립트 실행
node scripts/change-school-name.js "금성고등학교" "금성고"

# 변경사항 커밋
git add -A
git commit -m "Change school to 금성고등학교"
git push origin main
```

### 3. Railway 배포 (3분)
1. [Railway.app](https://railway.app) 로그인
2. **New Project** → **Deploy from GitHub repo**
3. Fork한 리포지토리 선택
4. **Add Service** → **Database** → **PostgreSQL**

### 4. 환경변수 설정 (30초)
앱 서비스 → Variables 탭에서:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_URL=생성된_Railway_URL
NEXTAUTH_SECRET=임의의_32자_문자열
```

### 5. 데이터베이스 초기화 (1분)
Railway Shell에서:
```bash
npm run db:push
```

## ✅ 완료!

이제 `https://YOUR-APP.up.railway.app` 에서 금성고 학생들이 사용할 수 있습니다.

---

## 🎨 추가 커스터마이징 옵션

### 방학 기간 변경
`lib/constants/index.ts`:
```typescript
export const VACATION_START = new Date('2025-07-21')
export const VACATION_END = new Date('2025-08-17')
```

### 이메일 도메인 제한 (선택사항)
`lib/auth.ts`에서 특정 학교 이메일만 허용:
```typescript
if (!email?.endsWith('@geumseong.hs.kr')) {
  throw new Error('금성고 이메일만 가입 가능합니다')
}
```

### 색상 테마 변경
`app/globals.css`:
```css
:root {
  --primary: 색상코드;  /* 학교 대표색 */
}
```