#!/bin/bash

# EC2 초기 설정 스크립트
# 서버에서 처음 한 번만 실행

echo "🚀 EC2 서버 초기 설정 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 시스템 업데이트
echo -e "${YELLOW}시스템 업데이트 중...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# 2. Node.js 18 설치
echo -e "${YELLOW}Node.js 18 설치 중...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. PM2 설치
echo -e "${YELLOW}PM2 설치 중...${NC}"
sudo npm install -g pm2

# 4. Docker 설치
echo -e "${YELLOW}Docker 설치 중...${NC}"
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
sudo systemctl start docker
sudo systemctl enable docker

# 5. PostgreSQL과 Redis를 Docker로 실행
echo -e "${YELLOW}PostgreSQL과 Redis 시작 중...${NC}"
cd /home/ubuntu

# Docker Compose 파일 생성
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: growth-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: studylog_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: growth-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

# Docker Compose 실행
sudo docker-compose up -d

# 6. 방화벽 설정
echo -e "${YELLOW}방화벽 설정 중...${NC}"
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 5432
sudo ufw allow 6379
sudo ufw --force enable

# 7. 앱 디렉토리 생성
echo -e "${YELLOW}앱 디렉토리 생성 중...${NC}"
mkdir -p /home/ubuntu/vacation

echo -e "${GREEN}✅ EC2 서버 초기 설정 완료!${NC}"
echo -e "${GREEN}이제 deploy-ec2.sh 스크립트를 실행하여 앱을 배포할 수 있습니다.${NC}"