import { chromium, Browser, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Configuration
const BASE_URL = 'https://vacation-production-f151.up.railway.app';
const TEST_CREDENTIALS = {
  email: 'student1@test.com',
  password: 'student123!'
};

// Pages to capture
const PAGES_TO_CAPTURE = [
  { name: '01-homepage', url: '/', requiresAuth: false },
  { name: '02-signin', url: '/auth/signin', requiresAuth: false },
  { name: '03-dashboard', url: '/dashboard', requiresAuth: true },
  { name: '04-activities', url: '/dashboard/activities', requiresAuth: true },
  { name: '05-plan', url: '/dashboard/plan', requiresAuth: true },
  { name: '06-stats', url: '/dashboard/stats', requiresAuth: true },
  { name: '07-leaderboard', url: '/dashboard/leaderboard', requiresAuth: true }
];

// Screenshot directory
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

async function login(page: Page) {
  console.log('🔐 Logging in...');
  
  // Navigate to signin page
  await page.goto(`${BASE_URL}/auth/signin`, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Wait for form to be ready
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
  await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
  
  // Click submit button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { 
    timeout: 30000,
    waitUntil: 'networkidle' 
  });
  
  console.log('✅ Login successful');
}

async function captureScreenshot(page: Page, pageName: string, url: string) {
  console.log(`📸 Capturing ${pageName} (${url})...`);
  
  // Navigate to the page
  await page.goto(`${BASE_URL}${url}`, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Wait for content to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  
  // Additional wait for dynamic content
  await page.waitForTimeout(3000);
  
  // Scroll to bottom to trigger lazy loading
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0); // Scroll back to top
          setTimeout(() => resolve(), 1000); // Wait a bit after scrolling
        }
      }, 100);
    });
  });
  
  // Take screenshot
  const screenshotPath = path.join(SCREENSHOT_DIR, `${pageName}.png`);
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true,
    animations: 'disabled'
  });
  
  console.log(`✅ Screenshot saved: ${screenshotPath}`);
}

async function main() {
  console.log('🚀 Starting screenshot capture...\n');
  
  // Ensure screenshot directory exists
  await ensureScreenshotDir();
  
  // Launch browser
  const browser: Browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new context with viewport settings
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul'
    });
    
    // Create a new page
    const page: Page = await context.newPage();
    
    // Set default navigation timeout
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    let isLoggedIn = false;
    
    // Capture each page
    for (const pageInfo of PAGES_TO_CAPTURE) {
      try {
        // Login if required and not already logged in
        if (pageInfo.requiresAuth && !isLoggedIn) {
          await login(page);
          isLoggedIn = true;
        }
        
        // Skip re-capturing signin page if already logged in
        if (pageInfo.name === '02-signin' && isLoggedIn) {
          console.log(`⏭️  Skipping ${pageInfo.name} (already logged in)`);
          continue;
        }
        
        await captureScreenshot(page, pageInfo.name, pageInfo.url);
      } catch (error) {
        console.error(`❌ Error capturing ${pageInfo.name}:`, error);
      }
    }
    
    console.log('\n✨ Screenshot capture completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main };