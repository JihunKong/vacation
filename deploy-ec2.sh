#!/bin/bash

# EC2 배포 스크립트 - 성장닷컴
# EC2 Server: 43.200.27.173

echo "🚀 EC2 서버 배포 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# EC2 서버 정보
EC2_HOST="43.200.27.173"
EC2_USER="ubuntu"
PEM_FILE="GROWTH.pem"
REMOTE_DIR="/home/ubuntu/vacation"

# 1. 로컬 빌드
echo -e "${YELLOW}📦 프로덕션 빌드 시작...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 빌드 완료${NC}"

# 2. 필요한 파일들 압축
echo -e "${YELLOW}📦 배포 파일 압축 중...${NC}"
tar -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    prisma \
    app \
    components \
    lib \
    .env.production \
    next.config.mjs \
    tailwind.config.ts \
    tsconfig.json \
    postcss.config.mjs

echo -e "${GREEN}✅ 압축 완료${NC}"

# 3. EC2로 파일 전송
echo -e "${YELLOW}📤 EC2 서버로 파일 전송 중...${NC}"
scp -i "$PEM_FILE" deploy.tar.gz "$EC2_USER@$EC2_HOST:~/"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 파일 전송 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 파일 전송 완료${NC}"

# 4. EC2에서 배포 실행
echo -e "${YELLOW}🔧 EC2 서버에서 배포 실행 중...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    # 디렉토리 생성 및 이동
    mkdir -p /home/ubuntu/vacation
    cd /home/ubuntu/vacation

    # 기존 파일 백업
    if [ -d ".next" ]; then
        echo "기존 파일 백업 중..."
        sudo rm -rf .next.backup
        mv .next .next.backup
    fi

    # 압축 해제
    echo "파일 압축 해제 중..."
    tar -xzf ~/deploy.tar.gz

    # .env.production을 .env로 복사
    cp .env.production .env

    # npm 패키지 설치
    echo "패키지 설치 중..."
    npm install --production

    # Prisma 클라이언트 생성
    echo "Prisma 클라이언트 생성 중..."
    npx prisma generate

    # 데이터베이스 마이그레이션
    echo "데이터베이스 마이그레이션 중..."
    npx prisma db push

    # PM2로 앱 재시작
    echo "애플리케이션 재시작 중..."
    pm2 stop vacation || true
    pm2 delete vacation || true
    pm2 start npm --name "vacation" -- start
    pm2 save

    echo "✅ 배포 완료!"
    
    # 정리
    rm ~/deploy.tar.gz
ENDSSH

# 5. 로컬 정리
echo -e "${YELLOW}🧹 로컬 파일 정리 중...${NC}"
rm deploy.tar.gz

echo -e "${GREEN}🎉 EC2 배포 완료!${NC}"
echo -e "${GREEN}📍 접속 주소: http://$EC2_HOST:3000${NC}"
echo -e "${GREEN}🌱 성장닷컴이 EC2 서버에서 실행 중입니다!${NC}"