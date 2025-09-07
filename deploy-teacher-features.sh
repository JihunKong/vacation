#!/bin/bash

# Teacher Features Deployment Script
# This script safely deploys the teacher features to production

set -e  # Exit on error

echo "🚀 Starting Teacher Features Deployment..."

# Variables
REMOTE_HOST="43.200.27.173"
REMOTE_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/vacation"
PEM_FILE="GROWTH.pem"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Creating deployment package...${NC}"

# Create deployment package
tar -czf teacher-features-deploy.tar.gz \
  app/teacher \
  app/api/teacher \
  app/api/notifications \
  components/teacher \
  components/features/notification-bell.tsx \
  components/layout/dashboard-nav.tsx \
  prisma/schema.prisma \
  package.json

echo -e "${GREEN}✅ Package created successfully${NC}"

echo -e "${YELLOW}🔒 Connecting to production server...${NC}"

# Deploy to server
ssh -i "$PEM_FILE" "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
set -e

echo "📂 Backing up current version..."
cd /home/ubuntu/vacation
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz app components prisma package.json

echo "✅ Backup completed"
ENDSSH

echo -e "${YELLOW}📤 Uploading new files...${NC}"

# Copy deployment package to server
scp -i "$PEM_FILE" teacher-features-deploy.tar.gz "$REMOTE_USER@$REMOTE_HOST:/home/ubuntu/vacation/"

# Extract and deploy
ssh -i "$PEM_FILE" "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
set -e

cd /home/ubuntu/vacation

echo "📦 Extracting deployment package..."
tar -xzf teacher-features-deploy.tar.gz

echo "🔧 Installing dependencies..."
npm install

echo "🗄️ Updating database schema..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studylog_db" npx prisma db push

echo "🏗️ Building application..."
npm run build

echo "♻️ Restarting PM2..."
pm2 restart studylog

echo "✅ Deployment completed successfully!"

# Cleanup
rm teacher-features-deploy.tar.gz

# Check application status
sleep 5
pm2 status studylog
curl -I http://localhost:3000 | head -n 1
ENDSSH

echo -e "${GREEN}🎉 Teacher features deployed successfully!${NC}"
echo -e "${GREEN}✅ Application is running at: https://xn--oj4b21j.com${NC}"
echo ""
echo "📝 Post-deployment checklist:"
echo "  1. Test teacher login at /auth/signin"
echo "  2. Verify teacher activities page at /teacher/activities"  
echo "  3. Test feedback functionality"
echo "  4. Check notification system"
echo "  5. Monitor logs: ssh -i $PEM_FILE $REMOTE_USER@$REMOTE_HOST 'pm2 logs studylog'"