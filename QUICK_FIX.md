# 🚨 긴급 데이터베이스 테이블 생성 가이드

## 방법 1: Railway Shell 사용 (권장) ⭐

1. [Railway 대시보드](https://railway.app) 로그인
2. **vacation** 프로젝트 클릭
3. **vacation-production-f151** 서비스 클릭
4. 우측 상단 **⋮** 메뉴 → **Railway Shell** 클릭
5. 셸에서 다음 명령 실행:

```bash
npm run db:push
```

## 방법 2: 로컬에서 직접 실행

### 단계 1: DATABASE_URL 복사
1. Railway 대시보드 → vacation 프로젝트
2. **PostgreSQL** 서비스 클릭
3. **Variables** 탭
4. **DATABASE_URL** 값 복사 (postgresql://로 시작하는 전체 URL)

### 단계 2: 로컬에서 실행
터미널에서:

```bash
# DATABASE_URL 설정 (복사한 URL로 교체)
export DATABASE_URL="postgresql://postgres:비밀번호@호스트:포트/railway"

# 테이블 생성
npm run db:push

# 확인
npm run db:check
```

## 방법 3: create-tables-direct.js 사용

1. `scripts/create-tables-direct.js` 파일 열기
2. DATABASE_URL 변수에 Railway의 DATABASE_URL 붙여넣기
3. 실행:
```bash
node scripts/create-tables-direct.js
```

## 성공 확인

테이블이 생성되면 다음과 같이 표시됩니다:
```
✅ User 테이블: 0개 레코드
✅ StudentProfile 테이블: 0개 레코드
✅ Plan 테이블: 0개 레코드
✅ PlanItem 테이블: 0개 레코드
✅ Activity 테이블: 0개 레코드
✅ Badge 테이블: 0개 레코드
✅ Summary 테이블: 0개 레코드
```

이제 https://vacation-production-f151.up.railway.app 에서 회원가입이 가능합니다!