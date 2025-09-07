#!/bin/bash

# EC2 서버 정적 파일 서빙 문제 해결 스크립트

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}EC2 서버 정적 파일 문제 수정 스크립트${NC}"

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

echo -e "${YELLOW}EC2 서버에 연결하여 문제를 수정합니다...${NC}"

ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

# Color codes for remote
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. PM2 프로세스 상태 확인${NC}"
pm2 list

echo -e "${YELLOW}2. Nginx 설정 확인${NC}"
if [ -f /etc/nginx/sites-available/default ]; then
    echo "Nginx configuration found"
    sudo cat /etc/nginx/sites-available/default | grep -A 10 "server_name"
fi

echo -e "${YELLOW}3. Caddy 설정 확인${NC}"
if [ -f /etc/caddy/Caddyfile ]; then
    echo "Caddy configuration found"
    sudo cat /etc/caddy/Caddyfile
fi

echo -e "${YELLOW}4. Next.js 앱 직접 접근 테스트${NC}"
curl -I http://localhost:3000 | head -n 5

echo -e "${YELLOW}5. PM2 로그 확인${NC}"
pm2 logs vacation --lines 20 --nostream

echo -e "${YELLOW}6. 포트 사용 상태 확인${NC}"
sudo lsof -i :3000 | head -5
sudo lsof -i :80 | head -5
sudo lsof -i :443 | head -5

echo -e "${YELLOW}7. Nginx 설정 업데이트 (필요한 경우)${NC}"
if [ -f /etc/nginx/sites-available/default ]; then
    # Nginx 설정 백업
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d)
    
    # Nginx 설정 생성
    sudo tee /etc/nginx/sites-available/vacation << 'EOF'
server {
    listen 80;
    server_name xn--oj4b21j.com www.xn--oj4b21j.com 43.200.27.173;

    client_max_body_size 100M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public files
    location /public {
        proxy_pass http://localhost:3000/public;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API routes
    location /api {
        proxy_pass http://localhost:3000/api;
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

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/vacation /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    echo -e "${GREEN}Nginx 설정이 업데이트되었습니다${NC}"
else
    echo -e "${YELLOW}Nginx가 설치되어 있지 않습니다${NC}"
fi

echo -e "${YELLOW}8. Caddy 설정 업데이트 (필요한 경우)${NC}"
if [ -f /etc/caddy/Caddyfile ]; then
    # Caddy 설정 백업
    sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d)
    
    # Caddy 설정 업데이트
    sudo tee /etc/caddy/Caddyfile << 'EOF'
xn--oj4b21j.com {
    reverse_proxy localhost:3000
    
    header {
        X-Frame-Options SAMEORIGIN
        X-Content-Type-Options nosniff
        X-XSS-Protection "1; mode=block"
    }
    
    handle_path /_next/static/* {
        header Cache-Control "public, max-age=31536000, immutable"
        reverse_proxy localhost:3000
    }
    
    handle_path /public/* {
        header Cache-Control "public, max-age=31536000, immutable"
        reverse_proxy localhost:3000
    }
}

www.xn--oj4b21j.com {
    redir https://xn--oj4b21j.com{uri} permanent
}
EOF
    
    # Reload Caddy
    sudo systemctl reload caddy
    echo -e "${GREEN}Caddy 설정이 업데이트되었습니다${NC}"
else
    echo -e "${YELLOW}Caddy가 설치되어 있지 않습니다${NC}"
fi

echo -e "${YELLOW}9. PM2 프로세스 재시작${NC}"
pm2 restart vacation
pm2 save

echo -e "${GREEN}✅ 서버 설정이 완료되었습니다${NC}"

ENDSSH

echo -e "${GREEN}✅ EC2 서버 수정이 완료되었습니다!${NC}"
echo -e "${YELLOW}브라우저 캐시를 삭제하고 다시 시도해보세요${NC}"