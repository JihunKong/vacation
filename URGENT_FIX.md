# 🚨 긴급: Railway 데이터베이스 연결 문제 해결

## 문제 진단

현재 상황:
- ample-serenity 프로젝트의 PostgreSQL에 테이블이 생성됨
- 하지만 vacation-production-f151 앱은 여전히 테이블을 찾지 못함
- 이는 vacation 앱이 다른 데이터베이스를 사용하고 있다는 의미

## 즉시 해결 방법

### 1. Railway 대시보드에서 확인

1. [Railway 대시보드](https://railway.app) 로그인
2. **ample-serenity** 프로젝트로 이동
3. **vacation-production-f151** 서비스 클릭
4. **Variables** 탭 확인

### 2. DATABASE_URL 확인

vacation 앱의 Variables에서:
- `DATABASE_URL`이 있는지 확인
- 값이 ample-serenity의 PostgreSQL을 가리키는지 확인

### 3. DATABASE_URL이 없거나 잘못된 경우

1. **ample-serenity** 프로젝트의 **PostgreSQL** 서비스로 이동
2. **Variables** 탭에서 `DATABASE_PUBLIC_URL` 복사
3. **vacation** 서비스의 **Variables** 탭으로 이동
4. **New Variable** 클릭
5. 다음 추가:
   - Name: `DATABASE_URL`
   - Value: `복사한 DATABASE_PUBLIC_URL 값`
6. **Add** 클릭

### 4. 앱 재배포

Variables 수정 후:
1. vacation 서비스의 **Deployments** 탭
2. 최신 배포의 **⋮** → **Redeploy**

### 5. 또는 Railway Shell에서 직접 실행

vacation 서비스의 Railway Shell에서:
```bash
npm run db:push
```

## 빠른 확인 방법

vacation 서비스의 Railway Shell에서:
```bash
echo $DATABASE_URL
```

이 값이 PostgreSQL의 URL과 일치해야 합니다.

## 예상되는 DATABASE_URL 형식

```
postgresql://postgres:pJKqbavlJeeLApxBgHrVMMeAZGnVQUPO@gondola.proxy.rlwy.net:19477/railway
```

이 값이 vacation 앱의 DATABASE_URL 환경변수에 설정되어 있어야 합니다!