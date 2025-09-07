#!/bin/bash

# PM2 포트 충돌 문제 해결 스크립트

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}PM2 포트 충돌 문제 해결 스크립트${NC}"

# Variables
EC2_HOST="43.200.27.173"
EC2_USER="ubuntu"
PEM_FILE="/Users/jihunkong/vacation/GROWTH.pem"

# Check PEM file
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

chmod 400 "$PEM_FILE"

echo -e "${YELLOW}EC2 서버에서 포트 충돌 문제를 해결합니다...${NC}"

ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

# Color codes for remote
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. 현재 PM2 프로세스 확인${NC}"
pm2 list

echo -e "${YELLOW}2. 포트 3000 사용 중인 프로세스 확인${NC}"
sudo lsof -i :3000 || true

echo -e "${YELLOW}3. growth-com이 포트 3000을 사용 중인지 확인${NC}"
pm2 describe growth-com | grep -E "port|PORT" || echo "No port info found"

echo -e "${YELLOW}4. 모든 PM2 프로세스 중지${NC}"
pm2 stop all

echo -e "${YELLOW}5. vacation 프로세스 삭제${NC}"
pm2 delete vacation || true

echo -e "${YELLOW}6. 포트 3000 다시 확인${NC}"
sudo lsof -i :3000 || echo "Port 3000 is free"

echo -e "${YELLOW}7. growth-com은 다른 포트로 재시작 (포트 3001)${NC}"
cd /home/ubuntu/growth-com 2>/dev/null && {
    pm2 delete growth-com || true
    PORT=3001 pm2 start npm --name "growth-com" -- start
} || echo "growth-com directory not found, skipping..."

echo -e "${YELLOW}8. vacation을 포트 3000으로 시작${NC}"
cd /home/ubuntu/vacation
PORT=3000 pm2 start npm --name "vacation" -- start

echo -e "${YELLOW}9. PM2 설정 저장${NC}"
pm2 save

echo -e "${YELLOW}10. 최종 상태 확인${NC}"
pm2 list
sleep 5
pm2 list

echo -e "${YELLOW}11. Nginx 설정 확인 및 재시작${NC}"
# Remove duplicate config
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}✅ PM2 포트 문제가 해결되었습니다${NC}"
echo -e "${GREEN}vacation: http://localhost:3000${NC}"
echo -e "${GREEN}growth-com: http://localhost:3001 (if exists)${NC}"

# Test the applications
echo -e "${YELLOW}12. 애플리케이션 테스트${NC}"
curl -I http://localhost:3000 | head -n 3

ENDSSH

echo -e "${GREEN}✅ EC2 서버 포트 문제가 해결되었습니다!${NC}"