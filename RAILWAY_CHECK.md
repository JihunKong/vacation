# Railway 배포 상태 체크리스트

## 1. 서비스 확인
- [ ] vacation 앱 서비스가 실행 중인가?
- [ ] PostgreSQL 데이터베이스 서비스가 추가되었는가?

## 2. 환경변수 확인 (Variables 탭)
- [ ] DATABASE_URL (PostgreSQL 추가 시 자동 설정)
- [ ] NEXTAUTH_URL = https://vacation-production-f151.up.railway.app
- [ ] NEXTAUTH_SECRET = teNf2G/hrXQAmzakPktmEA6Ptow+BbOJu7PP7hX2GyY=

## 3. 빌드 로그 확인
- [ ] "Checking DATABASE_URL..." 메시지가 표시되는가?
- [ ] "DATABASE_URL is set" 메시지가 표시되는가?
- [ ] "Running prisma db push" 메시지가 표시되는가?
- [ ] 빌드가 성공적으로 완료되었는가?

## 4. 배포 상태
- [ ] 앱이 정상적으로 배포되었는가?
- [ ] https://vacation-production-f151.up.railway.app 접속이 가능한가?

## 5. 데이터베이스 연결 테스트
Railway 대시보드에서 PostgreSQL 서비스를 클릭하고:
1. **Data** 탭으로 이동
2. 테이블 목록에서 다음 테이블들이 생성되었는지 확인:
   - User
   - StudentProfile
   - Plan
   - PlanItem
   - Activity
   - Badge
   - Summary

## 문제 해결

### DATABASE_URL이 설정되지 않은 경우
1. PostgreSQL 서비스가 추가되었는지 확인
2. 앱 서비스의 Variables 탭에서 DATABASE_URL이 있는지 확인
3. 없다면 PostgreSQL의 DATABASE_URL을 복사해서 수동으로 추가

### 테이블이 생성되지 않은 경우
Railway Shell에서 수동으로 실행:
```bash
railway run npm run db:push
```

또는 Railway 대시보드의 앱 서비스에서:
1. **Settings** 탭
2. **Deploy** 섹션
3. **Redeploy** 버튼 클릭