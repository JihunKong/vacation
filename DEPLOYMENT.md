# Railway 배포 가이드

## 환경변수 설정

Railway 대시보드 (https://railway.app) 에서 vacation 프로젝트를 찾아 다음 환경변수를 설정하세요:

### 필수 환경변수

1. **NEXTAUTH_URL**
   ```
   https://vacation-production-f151.up.railway.app
   ```

2. **NEXTAUTH_SECRET**
   ```
   teNf2G/hrXQAmzakPktmEA6Ptow+BbOJu7PP7hX2GyY=
   ```

3. **DATABASE_URL**
   - Railway PostgreSQL 서비스를 프로젝트에 추가하면 자동으로 설정됩니다
   - 또는 기존 PostgreSQL의 DATABASE_URL을 사용하세요

4. **OPENAI_API_KEY** (선택사항 - 교사 기능용)
   ```
   your-openai-api-key
   ```

## 데이터베이스 설정

배포 후 다음 명령을 실행하여 데이터베이스 스키마를 생성하세요:

```bash
npx prisma db push
```

## 확인사항

1. **빌드 명령어**: `npm run build` (package.json에 이미 설정됨)
2. **시작 명령어**: `npm run start` (package.json에 이미 설정됨)
3. **Node.js 버전**: 18.x 이상

## 배포 완료 후

1. https://vacation-production-f151.up.railway.app 접속
2. 회원가입 후 로그인
3. 정상 작동 확인