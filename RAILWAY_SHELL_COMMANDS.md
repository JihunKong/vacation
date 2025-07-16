# Railway Shell 명령어

vacation-production-f151 서비스의 Railway Shell에서 실행:

## 1. 환경변수 확인
```bash
echo $DATABASE_URL
```

예상 출력:
```
postgresql://postgres:pJKqbavlJeeLApxBgHrVMMeAZGnVQUPO@postgres.railway.internal:5432/railway
```

## 2. 테이블 생성
```bash
npm run db:push
```

## 3. 테이블 확인
```bash
npm run db:check
```

## 4. 만약 실패하면 수동으로
```bash
npx prisma generate
npx prisma db push --accept-data-loss
```

## 5. Prisma Studio로 확인 (선택사항)
```bash
npx prisma studio
```

주의: Railway Shell은 vacation 앱 컨테이너 내부에서 실행되므로 
postgres.railway.internal 주소로 접근이 가능합니다.