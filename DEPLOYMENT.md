# Railway 배포 가이드

## 환경변수 설정

Railway 대시보드 (https://railway.app) 에서 vacation 프로젝트를 찾아 다음 환경변수를 설정하세요:

### 1단계: PostgreSQL 데이터베이스 추가
1. Railway 프로젝트에서 **New** 버튼 클릭
2. **Database** → **Add PostgreSQL** 선택
3. PostgreSQL이 생성되면 DATABASE_URL이 자동으로 설정됩니다

### 2단계: 환경변수 추가
프로젝트의 **Variables** 탭에서 다음 변수들을 추가하세요:

1. **NEXTAUTH_URL**
   ```
   https://vacation-production-f151.up.railway.app
   ```

2. **NEXTAUTH_SECRET**
   ```
   teNf2G/hrXQAmzakPktmEA6Ptow+BbOJu7PP7hX2GyY=
   ```

3. **DATABASE_URL**
   - PostgreSQL 서비스를 추가하면 자동으로 설정됩니다
   - 수동으로 설정할 경우: `postgresql://user:password@host:port/database`

4. **OPENAI_API_KEY** (선택사항 - 교사 기능용)
   ```
   your-openai-api-key
   ```

## 데이터베이스 설정

빌드 과정에서 자동으로 데이터베이스 스키마가 생성됩니다.
만약 수동으로 실행해야 한다면:

```bash
railway run npm run db:push
```

## 확인사항

1. **빌드 명령어**: `npm run build` (package.json에 이미 설정됨)
2. **시작 명령어**: `npm run start` (package.json에 이미 설정됨)
3. **Node.js 버전**: 18.x 이상

## 배포 완료 후

1. https://vacation-production-f151.up.railway.app 접속
2. 회원가입 후 로그인
3. 정상 작동 확인