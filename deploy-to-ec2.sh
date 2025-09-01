#!/bin/bash

# EC2 서버 직접 배포 스크립트
# 성장.com (xn--oj4b21j.com)

echo "🚀 성장닷컴 EC2 배포 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 서버 정보
EC2_HOST="43.200.27.173"
EC2_USER="ubuntu"
PEM_FILE="GROWTH.pem"

# 1. 빌드
echo -e "${YELLOW}📦 프로덕션 빌드 중...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패${NC}"
    exit 1
fi

# 2. 파일 압축
echo -e "${YELLOW}📦 파일 압축 중...${NC}"
tar -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    prisma \
    app \
    components \
    lib \
    scripts \
    .env.production \
    next.config.js \
    nginx.conf \
    docker-compose.production.yml

# 3. EC2로 전송
echo -e "${YELLOW}📤 EC2 서버로 전송 중...${NC}"
scp -i "$PEM_FILE" deploy.tar.gz "$EC2_USER@$EC2_HOST:~/"

# 4. EC2에서 배포 실행
echo -e "${YELLOW}🔧 EC2에서 배포 실행 중...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    
    # 디렉토리 준비
    cd ~
    mkdir -p vacation
    cd vacation
    
    # 백업
    if [ -d ".next" ]; then
        echo "기존 파일 백업 중..."
        rm -rf .next.backup
        mv .next .next.backup
    fi
    
    # 압축 해제
    echo "압축 해제 중..."
    tar -xzf ~/deploy.tar.gz
    rm ~/deploy.tar.gz
    
    # 환경 변수 설정
    cp .env.production .env
    
    # Docker 컨테이너 확인 및 시작
    echo "Docker 컨테이너 확인 중..."
    if ! docker ps | grep -q growth-postgres; then
        echo "PostgreSQL 시작 중..."
        docker run -d \
            --name growth-postgres \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=studylog_db \
            -p 5432:5432 \
            -v postgres_data:/var/lib/postgresql/data \
            --restart unless-stopped \
            postgres:15-alpine
    fi
    
    if ! docker ps | grep -q growth-redis; then
        echo "Redis 시작 중..."
        docker run -d \
            --name growth-redis \
            -p 6379:6379 \
            -v redis_data:/data \
            --restart unless-stopped \
            redis:7-alpine \
            redis-server --appendonly yes
    fi
    
    # 잠시 대기
    sleep 5
    
    # npm 패키지 설치
    echo "패키지 설치 중..."
    npm install --production
    
    # Prisma 설정
    echo "Prisma 설정 중..."
    npx prisma generate
    npx prisma db push
    
    # PM2로 앱 시작
    echo "애플리케이션 시작 중..."
    pm2 stop growth-com 2>/dev/null || true
    pm2 delete growth-com 2>/dev/null || true
    PORT=3000 pm2 start npm --name "growth-com" -- start
    pm2 save
    
    # Nginx 설정 (SSL 없이 먼저)
    if [ -f "nginx.conf" ]; then
        echo "Nginx 설정 중..."
        # HTTP only 설정 생성
        cat > /tmp/nginx-http.conf << 'EOF'
server {
    listen 80;
    server_name xn--oj4b21j.com www.xn--oj4b21j.com 43.200.27.173;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
        sudo cp /tmp/nginx-http.conf /etc/nginx/sites-available/growth-com
        sudo ln -sf /etc/nginx/sites-available/growth-com /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl reload nginx
    fi
    
    echo "✅ 배포 완료!"
    echo "📍 접속 주소:"
    echo "   - http://43.200.27.173:3000"
    echo "   - http://xn--oj4b21j.com (도메인 설정 필요)"
    echo "   - http://성장.com (한글 도메인)"
    
    # 상태 확인
    pm2 status
ENDSSH

# 5. 로컬 정리
rm deploy.tar.gz

echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "${GREEN}📍 접속 주소:${NC}"
echo -e "${GREEN}   - http://43.200.27.173:3000${NC}"
echo -e "${GREEN}   - http://xn--oj4b21j.com (도메인)${NC}"
echo -e "${GREEN}   - http://성장.com (한글 도메인)${NC}"