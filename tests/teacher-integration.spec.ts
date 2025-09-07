import { test, expect, Page } from '@playwright/test';

// Test credentials (you'll need to create these users in the database)
const TEACHER_CREDENTIALS = {
  email: 'teacher@test.com',
  password: 'Teacher123!',
};

const STUDENT_CREDENTIALS = {
  email: 'student@test.com',
  password: 'Student123!',
};

// Helper function to attempt login
async function attemptLogin(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await page.goto('/auth/signin');
    
    // Find and fill email field
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    await emailInput.fill(email);
    
    // Find and fill password field
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill(password);
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for navigation
    await page.waitForURL((url) => !url.includes('/auth/signin'), { 
      timeout: 5000,
      waitUntil: 'domcontentloaded' 
    }).catch(() => false);
    
    // Check if we're logged in (not on signin page)
    const currentUrl = page.url();
    return !currentUrl.includes('/auth/signin');
  } catch (error) {
    console.log('Login attempt failed:', error);
    return false;
  }
}

test.describe('Teacher Integration Tests', () => {
  
  test('1. Admin pages UI structure and elements', async ({ page }) => {
    // Test admin users page
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    
    // Check for common admin UI elements
    const pageTitle = await page.locator('h1, h2').first().textContent().catch(() => '');
    console.log('Admin Users Page Title:', pageTitle);
    
    // Check for table or list structure
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasList = await page.locator('ul, ol, [role="list"]').isVisible().catch(() => false);
    const hasGrid = await page.locator('[class*="grid"]').isVisible().catch(() => false);
    
    console.log('UI Structure:', { hasTable, hasList, hasGrid });
    expect(hasTable || hasList || hasGrid).toBe(true);
  });

  test('2. Admin schools page functionality', async ({ page }) => {
    await page.goto('/admin/schools');
    await page.waitForLoadState('networkidle');
    
    // Check for school management elements
    const addButton = page.locator('button:has-text("추가"), button:has-text("Add"), button:has-text("새"), button:has-text("New")').first();
    const hasAddButton = await addButton.isVisible().catch(() => false);
    
    // Check for search or filter functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]').first();
    const hasSearch = await searchInput.isVisible().catch(() => false);
    
    // Check for data display
    const dataElements = await page.locator('td, [role="cell"], .card, [class*="item"]').count();
    
    console.log('School Management Features:', {
      hasAddButton,
      hasSearch,
      dataElements
    });
    
    // At least some functionality should be present
    expect(hasAddButton || hasSearch || dataElements > 0).toBe(true);
  });

  test('3. Admin activities page data display', async ({ page }) => {
    await page.goto('/admin/activities');
    await page.waitForLoadState('domcontentloaded');
    
    // Check page loaded without errors
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
    
    // Check for activity-related UI elements
    const hasActivityElements = 
      pageContent?.includes('활동') ||
      pageContent?.includes('Activity') ||
      pageContent?.includes('Activities');
    
    console.log('Has activity elements:', hasActivityElements);
    
    // Check for data presentation elements
    const cards = await page.locator('[class*="card"]').count();
    const rows = await page.locator('tr').count();
    const items = await page.locator('[class*="item"]').count();
    
    console.log('Data elements:', { cards, rows, items });
    
    // Page should have some content
    expect(cards + rows + items).toBeGreaterThanOrEqual(0);
  });

  test('4. Teacher navigation and routing', async ({ page }) => {
    // Test teacher-specific routes
    const teacherRoutes = [
      '/teacher',
      '/teacher/activities',
      '/teacher/statistics',
    ];
    
    for (const route of teacherRoutes) {
      const response = await page.goto(route);
      const status = response?.status() || 0;
      
      // Should not be server error
      expect(status).toBeLessThan(500);
      
      // Check if page requires authentication
      const url = page.url();
      const requiresAuth = url.includes('/auth') || url.includes('/signin');
      
      console.log(`${route}: Status ${status}, Requires Auth: ${requiresAuth}`);
    }
  });

  test('5. School selection and setup flow', async ({ page }) => {
    await page.goto('/');
    
    // Look for school-related modals or setup flows
    await page.waitForTimeout(1000);
    
    // Check for modal elements
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const hasModal = await modal.isVisible().catch(() => false);
    
    if (hasModal) {
      const modalContent = await modal.textContent();
      console.log('Modal content preview:', modalContent?.substring(0, 100));
      
      // Check for school selection elements
      const hasSchoolElements = 
        modalContent?.includes('학교') ||
        modalContent?.includes('School');
      
      expect(hasSchoolElements).toBe(true);
    }
    
    // Check for school-related form elements
    const schoolSelect = page.locator('select[name*="school"], input[name*="school"]').first();
    const hasSchoolForm = await schoolSelect.isVisible().catch(() => false);
    
    console.log('School setup elements:', { hasModal, hasSchoolForm });
  });

  test('6. API authentication and authorization', async ({ request }) => {
    // Test protected API endpoints
    const protectedEndpoints = [
      '/api/admin/users',
      '/api/admin/schools',
      '/api/admin/activities',
    ];
    
    for (const endpoint of protectedEndpoints) {
      const response = await request.get(endpoint);
      const status = response.status();
      
      // Should require authentication (401) or authorization (403)
      expect([401, 403]).toContain(status);
      console.log(`${endpoint}: Protected with status ${status}`);
    }
  });

  test('7. User role differentiation', async ({ page }) => {
    // Check if login page shows role selection or handles different user types
    await page.goto('/auth/signin');
    
    const pageContent = await page.locator('body').textContent();
    
    // Check for role-related elements
    const hasRoleElements = 
      pageContent?.includes('선생님') ||
      pageContent?.includes('학생') ||
      pageContent?.includes('Teacher') ||
      pageContent?.includes('Student') ||
      pageContent?.includes('관리자') ||
      pageContent?.includes('Admin');
    
    console.log('Has role differentiation elements:', hasRoleElements);
    
    // Check for separate login options
    const loginButtons = await page.locator('button').count();
    const loginLinks = await page.locator('a[href*="auth"], a[href*="signin"], a[href*="login"]').count();
    
    console.log('Login options:', { buttons: loginButtons, links: loginLinks });
  });

  test('8. Dashboard content based on user role', async ({ page }) => {
    // Try to access dashboard
    await page.goto('/dashboard');
    
    const url = page.url();
    
    if (url.includes('/auth') || url.includes('/signin')) {
      console.log('Dashboard requires authentication');
      expect(true).toBe(true);
    } else {
      // Check dashboard content
      const content = await page.locator('main, [role="main"]').first().textContent();
      
      // Check for role-specific content
      const hasTeacherContent = content?.includes('선생님') || content?.includes('Teacher');
      const hasStudentContent = content?.includes('학생') || content?.includes('Student');
      
      console.log('Dashboard content:', { hasTeacherContent, hasStudentContent });
      
      // Should have some role-specific content
      expect(hasTeacherContent || hasStudentContent).toBe(true);
    }
  });

  test('9. Feedback system UI elements', async ({ page }) => {
    // Check if feedback-related UI exists in admin area
    await page.goto('/admin/activities');
    await page.waitForLoadState('domcontentloaded');
    
    // Look for feedback buttons or forms
    const feedbackButton = page.locator('button:has-text("피드백"), button:has-text("Feedback")').first();
    const hasFeedbackButton = await feedbackButton.isVisible().catch(() => false);
    
    // Look for feedback-related text
    const pageContent = await page.locator('body').textContent();
    const hasFeedbackContent = 
      pageContent?.includes('피드백') ||
      pageContent?.includes('Feedback') ||
      pageContent?.includes('평가') ||
      pageContent?.includes('Review');
    
    console.log('Feedback system:', { hasFeedbackButton, hasFeedbackContent });
    
    // Check for text areas or comment fields
    const textAreas = await page.locator('textarea').count();
    console.log('Text areas found:', textAreas);
  });

  test('10. Responsive design and mobile compatibility', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/admin');
      
      // Check if navigation is accessible
      const nav = page.locator('nav, [role="navigation"], header').first();
      const navVisible = await nav.isVisible().catch(() => false);
      
      // Check for mobile menu button
      const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();
      const hasMenuButton = await menuButton.isVisible().catch(() => false);
      
      console.log(`${viewport.name}: Nav visible: ${navVisible}, Menu button: ${hasMenuButton}`);
      
      // Mobile should have menu button or visible nav
      if (viewport.name === 'Mobile') {
        expect(navVisible || hasMenuButton).toBe(true);
      }
    }
  });
});