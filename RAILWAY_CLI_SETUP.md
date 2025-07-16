# Railway CLI 설정 가이드

## 1. Railway 로그인

터미널에서 실행:
```bash
railway login
```

브라우저가 열리면 Railway 계정으로 로그인하세요.

## 2. 프로젝트 연결

로그인 후 vacation 디렉토리에서:
```bash
cd /Users/jihunkong/vacation
railway link
```

다음 순서로 선택:
1. **Korean_Teacher_K's Projects** (또는 귀하의 팀/계정)
2. **vacation** 프로젝트 선택
3. **production** 환경 선택

## 3. 연결 확인

```bash
railway status
```

다음과 같이 표시되어야 합니다:
```
Project: vacation
Environment: production
Service: <서비스명>
```

## 4. 데이터베이스 테이블 생성

```bash
railway run npm run db:push
```

또는:
```bash
railway run npx prisma db push
```

## 5. 테이블 생성 확인

```bash
railway run npm run db:check
```

## 문제 해결

### "Unauthorized" 오류
```bash
railway logout
railway login
```

### 잘못된 프로젝트에 연결된 경우
```bash
railway unlink
railway link
# vacation 프로젝트 선택
```

### 환경변수가 로드되지 않는 경우
```bash
railway run env | grep DATABASE_URL
```

값이 표시되지 않으면 Railway 대시보드에서 확인하세요.