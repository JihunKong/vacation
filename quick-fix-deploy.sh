#!/bin/bash

# Quick fix deployment using git push
# This script commits and pushes changes to GitHub
# The EC2 server can pull these changes

echo "🚀 Quick Fix Deployment via Git"
echo "================================"

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Found uncommitted changes..."
    
    # Add all changes
    git add .
    
    # Create commit message
    COMMIT_MSG="Fix: Pomodoro timer issues - Add navigation, fix 400 error, implement Web Audio API

- Fixed stuck Pomodoro sessions by marking cancelled sessions as completed
- Added navigation header to timer page by moving it to dashboard directory  
- Replaced bell.mp3 with Web Audio API for notification sounds
- Created database cleanup script for stuck sessions
- Updated timer path from /timer to /dashboard/timer"
    
    echo "💾 Committing changes..."
    git commit -m "$COMMIT_MSG"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next steps to deploy on EC2:"
echo "1. Access EC2 server when SSH is available"
echo "2. Run: cd /home/ubuntu/vacation"
echo "3. Run: git pull origin main"
echo "4. Run: npm install"
echo "5. Run: npm run build"
echo "6. Run: npm run db:fix-pomodoro (to fix stuck sessions)"
echo "7. Run: pm2 restart growth-com"
echo ""
echo "🔧 Alternative: Run database fix locally with production URL:"
echo "   DATABASE_URL=\"production_database_url\" npx tsx scripts/fix-production-pomodoro.ts"