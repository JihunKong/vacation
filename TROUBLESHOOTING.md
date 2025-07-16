# Railway 배포 문제 해결 가이드

## 현재 문제: 데이터베이스 테이블이 생성되지 않음

### 증상
```
Signup error: Error [PrismaClientKnownRequestError]: 
The table `public.User` does not exist in the current database.
```

### 원인
빌드 과정에서 `prisma db push`가 실행되지 않았거나 실패함

### 해결 방법 (우선순위 순)

## 1. Railway Shell 사용 (가장 빠름) ⭐

1. [Railway 대시보드](https://railway.app) 로그인
2. **vacation** 프로젝트 선택
3. 앱 서비스 (vacation-production-f151) 클릭
4. 우측 상단 **⋮** 메뉴 → **Railway Shell**
5. 다음 명령 실행:
   ```bash
   npm run db:push
   ```
6. 성공 메시지 확인

## 2. Run Command 사용

1. Railway 대시보드 → vacation 프로젝트
2. 앱 서비스 → **Settings** 탭
3. **Deploy** 섹션에서 **Run Command**
4. Command 입력: `npm run db:push`
5. **Run** 버튼 클릭

## 3. 재배포 트리거

1. Railway 대시보드 → vacation 프로젝트
2. 앱 서비스 → **Deployments** 탭
3. 최신 배포의 **⋮** → **Redeploy**
4. 빌드 로그에서 확인:
   - ✅ "Checking DATABASE_URL..."
   - ✅ "DATABASE_URL is set"
   - ✅ "Running prisma db push"

## 4. 수동 빌드 명령 실행

Railway Shell에서:
```bash
# 1. 환경변수 확인
echo $DATABASE_URL

# 2. Prisma 클라이언트 생성
npx prisma generate

# 3. 데이터베이스 스키마 적용
npx prisma db push

# 4. 테이블 확인
npx prisma studio
```

## 테이블 생성 확인

PostgreSQL 서비스에서:
1. **Data** 탭 이동
2. 생성된 테이블 확인:
   - ✅ User
   - ✅ StudentProfile
   - ✅ Plan
   - ✅ PlanItem
   - ✅ Activity
   - ✅ Badge
   - ✅ Summary

## 자주 발생하는 문제

### DATABASE_URL이 없는 경우
- PostgreSQL 서비스가 추가되었는지 확인
- Variables 탭에서 DATABASE_URL이 PostgreSQL을 참조하는지 확인

### 빌드가 실패하는 경우
- 빌드 로그에서 에러 메시지 확인
- Node.js 버전이 18.x 이상인지 확인

### 권한 문제
- PostgreSQL 사용자가 테이블 생성 권한이 있는지 확인
- Railway의 PostgreSQL은 기본적으로 모든 권한을 가짐

## 응급 해결책

만약 위 방법이 모두 실패하면:

1. 로컬에서 DATABASE_URL 설정:
   ```bash
   export DATABASE_URL="<Railway PostgreSQL URL>"
   npm run db:push
   ```

2. 또는 Railway CLI 재연결:
   ```bash
   railway login
   railway link
   # vacation 프로젝트 선택
   railway run npm run db:push
   ```

## 문의처
- Railway 지원: https://railway.app/help
- 프로젝트 이슈: https://github.com/JihunKong/vacation/issues