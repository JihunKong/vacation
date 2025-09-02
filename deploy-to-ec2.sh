#!/bin/bash

# EC2 서버 배포 스크립트
SERVER="ubuntu@43.200.27.173"
KEY="/Users/jihunkong/vacation/GROWTH.pem"

echo "🚀 Starting deployment to EC2..."

# 서버에서 코드 업데이트 및 빌드
ssh -i "$KEY" "$SERVER" << 'ENDSSH'
cd /home/ubuntu/vacation

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running Prisma generate..."
npx prisma generate

echo "🔨 Building project..."
npm run build

echo "♻️ Restarting PM2..."
pm2 restart vacation

echo "✅ Deployment completed!"
pm2 status
ENDSSH

echo "🌐 Check the site at: https://xn--oj4b21j.com"
