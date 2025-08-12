# Screenshot Capture Guide

## Overview
This directory contains an automated screenshot capture script for the Study Log application using Playwright.

## Files
- `capture-screenshots.ts` - Main screenshot capture script
- `screenshots/` - Directory containing captured screenshots

## Usage

### Run the screenshot capture
```bash
npm run screenshot
```

### Manual execution
```bash
npx tsx competition-docs/capture-screenshots.ts
```

## Captured Pages
The script automatically captures the following pages:

1. **Homepage** (`/`) - Public landing page
2. **Sign In** (`/auth/signin`) - Authentication page
3. **Dashboard** (`/dashboard`) - Main student dashboard (requires login)
4. **Activities** (`/dashboard/activities`) - Activity history page (requires login)
5. **Plan** (`/dashboard/plan`) - Study planning page (requires login)
6. **Stats** (`/dashboard/stats`) - Statistics page (requires login)
7. **Leaderboard** (`/dashboard/leaderboard`) - Ranking page (requires login)

## Configuration
- **URL**: https://vacation-production-f151.up.railway.app
- **Test Account**: student1@test.com / student123!
- **Browser**: Chromium (headless mode)
- **Viewport**: 1920x1080
- **Locale**: Korean (ko-KR)
- **Timezone**: Asia/Seoul

## Features
- Automatic login handling for authenticated pages
- Full page screenshots (including scrolled content)
- Smart waiting for dynamic content loading
- Lazy loading trigger by scrolling
- Error handling for individual page failures

## Output
Screenshots are saved in `competition-docs/screenshots/` with descriptive filenames:
- `01-homepage.png`
- `02-signin.png`
- `03-dashboard.png`
- `04-activities.png`
- `05-plan.png`
- `06-stats.png`
- `07-leaderboard.png`

## Requirements
- Node.js
- Playwright (@playwright/test)
- tsx (for TypeScript execution)

## Troubleshooting
If screenshots fail to capture:
1. Ensure Playwright browsers are installed: `npx playwright install chromium`
2. Check network connectivity to the application URL
3. Verify test credentials are still valid
4. Review console output for specific error messages