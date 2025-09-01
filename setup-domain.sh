#!/bin/bash

# 도메인 설정 스크립트 (EC2에서 실행)
# 성장.com (xn--oj4b21j.com)

echo "🌐 도메인 설정 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="xn--oj4b21j.com"
EMAIL="admin@xn--oj4b21j.com"

# 1. Nginx 설치 (없는 경우)
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx 설치 중...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# 2. Certbot 설치 (Let's Encrypt)
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Certbot 설치 중...${NC}"
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# 3. Nginx 기본 설정 (HTTP)
echo -e "${YELLOW}Nginx 설정 중...${NC}"
sudo tee /etc/nginx/sites-available/growth-com << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 4. Nginx 설정 활성화
sudo ln -sf /etc/nginx/sites-available/growth-com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 5. Nginx 테스트 및 재시작
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 6. 방화벽 설정
echo -e "${YELLOW}방화벽 설정 중...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp

# 7. SSL 인증서 획득 (선택사항)
echo -e "${YELLOW}SSL 인증서를 설정하시겠습니까? (y/n)${NC}"
read -r SSL_CHOICE

if [[ "$SSL_CHOICE" == "y" || "$SSL_CHOICE" == "Y" ]]; then
    echo -e "${YELLOW}Let's Encrypt SSL 인증서 획득 중...${NC}"
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL
    
    # 자동 갱신 설정
    echo "0 0,12 * * * root python3 -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
fi

echo -e "${GREEN}✅ 도메인 설정 완료!${NC}"
echo -e "${GREEN}📍 접속 주소:${NC}"
echo -e "${GREEN}   - http://$DOMAIN${NC}"
echo -e "${GREEN}   - http://성장.com${NC}"
if [[ "$SSL_CHOICE" == "y" || "$SSL_CHOICE" == "Y" ]]; then
    echo -e "${GREEN}   - https://$DOMAIN (SSL)${NC}"
    echo -e "${GREEN}   - https://성장.com (SSL)${NC}"
fi

# 8. 서비스 상태 확인
echo -e "${YELLOW}서비스 상태:${NC}"
sudo systemctl status nginx --no-pager
pm2 status