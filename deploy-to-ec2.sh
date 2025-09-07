#!/bin/bash

# EC2 deployment script for 성장.com
# IP: 43.200.27.173
# PEM file: /Users/jihunkong/vacation/GROWTH.pem

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to EC2 server (43.200.27.173)${NC}"

# Set variables
EC2_HOST="43.200.27.173"
EC2_USER="ubuntu"
PEM_FILE="/Users/jihunkong/vacation/GROWTH.pem"
PROJECT_NAME="vacation"
REMOTE_DIR="/home/ubuntu/vacation"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Set correct permissions for PEM file
chmod 400 "$PEM_FILE"

echo -e "${YELLOW}Step 1: Building the project locally...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Creating deployment archive...${NC}"
# Create a temporary directory for deployment files
rm -rf deploy-temp
mkdir -p deploy-temp

# Copy necessary files
cp -r .next deploy-temp/
cp -r public deploy-temp/
cp -r prisma deploy-temp/
cp package*.json deploy-temp/
cp next.config.ts deploy-temp/
cp tsconfig.json deploy-temp/
cp -r app deploy-temp/
cp -r components deploy-temp/
cp -r lib deploy-temp/
cp -r middleware.ts deploy-temp/ 2>/dev/null || true
cp CLAUDE.md deploy-temp/

# Create tarball
tar -czf deploy.tar.gz -C deploy-temp .
rm -rf deploy-temp

echo -e "${YELLOW}Step 3: Uploading to EC2 server...${NC}"
scp -i "$PEM_FILE" deploy.tar.gz "$EC2_USER@$EC2_HOST:/tmp/"
if [ $? -ne 0 ]; then
    echo -e "${RED}Upload failed! Check your connection and PEM file.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 4: Deploying on EC2 server...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

# Color codes for remote output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Extracting deployment files...${NC}"
cd /home/ubuntu
mkdir -p vacation-new
tar -xzf /tmp/deploy.tar.gz -C vacation-new/
rm /tmp/deploy.tar.gz

echo -e "${YELLOW}Installing dependencies...${NC}"
cd vacation-new
npm ci --production

echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

echo -e "${YELLOW}Running database migrations...${NC}"
# Using local Docker PostgreSQL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studylog_db"
npx prisma db push

echo -e "${YELLOW}Copying environment file...${NC}"
if [ -f /home/ubuntu/vacation/.env ]; then
    cp /home/ubuntu/vacation/.env .
else
    echo -e "${RED}Warning: .env file not found. Please create it manually.${NC}"
fi

echo -e "${YELLOW}Stopping existing PM2 process...${NC}"
pm2 stop vacation || true
pm2 delete vacation || true

echo -e "${YELLOW}Backing up current deployment...${NC}"
if [ -d /home/ubuntu/vacation ]; then
    mv /home/ubuntu/vacation /home/ubuntu/vacation-backup-$(date +%Y%m%d-%H%M%S)
fi

echo -e "${YELLOW}Activating new deployment...${NC}"
mv /home/ubuntu/vacation-new /home/ubuntu/vacation
cd /home/ubuntu/vacation

echo -e "${YELLOW}Starting application with PM2...${NC}"
pm2 start npm --name "vacation" -- start
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Application is running at: http://43.200.27.173:3000${NC}"
echo -e "${GREEN}Domain: https://xn--oj4b21j.com (성장.com)${NC}"

# Show PM2 status
pm2 status
ENDSSH

# Clean up local files
rm -f deploy.tar.gz

echo -e "${GREEN}✅ Deployment to EC2 completed successfully!${NC}"
echo -e "${GREEN}Application URL: https://xn--oj4b21j.com${NC}"
echo -e "${YELLOW}Note: Please ensure nginx/caddy is configured for HTTPS${NC}"