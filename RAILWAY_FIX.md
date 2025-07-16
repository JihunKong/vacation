# Railway 데이터베이스 테이블 생성 가이드

## 방법 1: Railway 웹 대시보드에서 실행

1. [Railway 대시보드](https://railway.app)에 로그인
2. vacation 프로젝트로 이동
3. 앱 서비스 선택 (vacation-production)
4. **Settings** 탭으로 이동
5. **Deploy** 섹션에서 **Run Command** 찾기
6. 다음 명령어 실행:
   ```
   npm run db:push
   ```

## 방법 2: 빌드 재시도

1. Railway 대시보드에서 vacation 프로젝트로 이동
2. 앱 서비스 선택
3. **Deployments** 탭으로 이동
4. 최신 배포의 **⋮** 메뉴 클릭
5. **Redeploy** 선택

빌드 로그에서 다음 메시지 확인:
- "Checking DATABASE_URL..."
- "DATABASE_URL is set"
- "Running prisma db push"

## 방법 3: Railway Shell 사용

1. Railway 대시보드에서 앱 서비스 선택
2. **⋮** 메뉴에서 **Railway Shell** 선택
3. 다음 명령어 실행:
   ```bash
   npm run db:push
   ```

## 테이블 생성 확인

PostgreSQL 서비스에서:
1. **Data** 탭으로 이동
2. 다음 테이블들이 생성되었는지 확인:
   - User
   - StudentProfile
   - Plan
   - PlanItem
   - Activity
   - Badge
   - Summary

## 문제가 지속되면

1. DATABASE_URL이 올바르게 설정되었는지 확인
2. PostgreSQL 서비스가 실행 중인지 확인
3. 앱과 PostgreSQL이 같은 프로젝트에 있는지 확인