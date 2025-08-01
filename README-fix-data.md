# 비정상 데이터 수정 방법

## Railway에서 직접 실행하기

Railway 대시보드에서 직접 실행하는 것이 가장 확실한 방법입니다:

1. Railway 대시보드에서 `vacation` 서비스 선택
2. 우측 상단의 "Settings" 탭 클릭
3. "Deploy" 섹션에서 "Run a command" 찾기
4. 다음 명령어 입력:
   ```
   npm run db:fix-data
   ```

## 또는 Railway CLI 사용 (원격 실행)

만약 위 방법이 안 되면:

1. 먼저 public DATABASE_URL 확인:
   ```bash
   railway variables --service postgres
   ```

2. TCP Proxy 정보 확인 (RAILWAY_TCP_PROXY_DOMAIN과 RAILWAY_TCP_PROXY_PORT)

3. 로컬에서 실행:
   ```bash
   DATABASE_URL="postgresql://postgres:pJKqbavlJeeLApxBgHrVMMeAZGnVQUPO@gondola.proxy.rlwy.net:19477/railway" npm run db:fix-data
   ```

## 스크립트가 하는 일

1. 모든 사용자의 실제 활동 기록을 조회
2. 활동 기록을 기반으로 정확한 XP, 레벨, 능력치 재계산
3. 비정상적인 데이터만 수정 (정상 데이터는 그대로 유지)
4. 수정 내역을 콘솔에 출력

이 스크립트는 안전하게 데이터를 정리하며, 실제 활동 기록을 기반으로만 계산합니다.