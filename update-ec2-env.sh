#!/bin/bash

# EC2 서버 환경변수 업데이트 스크립트

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}EC2 서버 환경변수 업데이트${NC}"

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

echo -e "${YELLOW}EC2 서버에 NEIS API 키 추가...${NC}"

ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

# Color codes for remote
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}환경변수 파일 업데이트...${NC}"

# .env 파일에 NEIS API 키 추가
cd /home/ubuntu/vacation

# NEIS API 키가 이미 있는지 확인
if grep -q "NEIS_API_KEY" .env; then
    echo -e "${YELLOW}NEIS API 키가 이미 존재합니다. 업데이트합니다...${NC}"
    sed -i '/NEIS_API_KEY/d' .env
fi

# NEIS API 키 추가
echo '' >> .env
echo '# NEIS API Key' >> .env
echo 'NEIS_API_KEY="bad69babd5034282a754c2b8b364ea53"' >> .env

echo -e "${GREEN}환경변수가 업데이트되었습니다${NC}"

# PM2 재시작
echo -e "${YELLOW}애플리케이션 재시작...${NC}"
pm2 restart vacation

echo -e "${GREEN}✅ 완료되었습니다${NC}"
ENDSSH

echo -e "${GREEN}✅ EC2 서버 환경변수 업데이트 완료!${NC}"