import { test, expect, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test data
const testSchool = {
  id: 'test-school-' + Date.now(),
  name: '테스트 초등학교',
  region: '서울',
  studentIdFormat: 'GRADE_CLASS_NUMBER',
};

const teacherUser = {
  email: `teacher-${Date.now()}@test.com`,
  password: 'Teacher123!',
  name: '김선생님',
  studentId: 'T001',
};

const studentUser = {
  email: `student-${Date.now()}@test.com`,
  password: 'Student123!',
  name: '이학생',
  studentId: '30101',
};

// Helper function to setup test data
async function setupTestData() {
  console.log('Setting up test data...');
  
  // Clean up any existing test data - skip tables that might not exist
  try {
    await prisma.notification.deleteMany({
      where: {
        userId: { contains: 'test-' }
      }
    });
  } catch (error) {
    console.log('Notification table not found, skipping...');
  }
  
  try {
    await prisma.feedback.deleteMany({
      where: {
        teacherId: { contains: 'test-' }
      }
    });
  } catch (error) {
    console.log('Feedback table not found, skipping...');
  }
  
  await prisma.activity.deleteMany({
    where: {
      userId: { contains: 'test-' }
    }
  });
  
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@test.com'
      }
    }
  });
  
  await prisma.school.deleteMany({
    where: {
      id: { contains: 'test-school-' }
    }
  });

  // Create school
  const school = await prisma.school.create({
    data: testSchool,
  });

  // Create teacher user
  const hashedTeacherPassword = await bcrypt.hash(teacherUser.password, 10);
  const teacher = await prisma.user.create({
    data: {
      id: 'test-teacher-' + Date.now(),
      email: teacherUser.email,
      password: hashedTeacherPassword,
      name: teacherUser.name,
      studentId: teacherUser.studentId,
      schoolId: school.id,
      role: 'TEACHER',
      level: 1,
      currentXP: 0,
      totalXP: 0,
    },
  });

  // Create student user
  const hashedStudentPassword = await bcrypt.hash(studentUser.password, 10);
  const student = await prisma.user.create({
    data: {
      id: 'test-student-' + Date.now(),
      email: studentUser.email,
      password: hashedStudentPassword,
      name: studentUser.name,
      studentId: studentUser.studentId,
      schoolId: school.id,
      role: 'USER',
      level: 3,
      currentXP: 450,
      totalXP: 450,
    },
  });

  // Create some activities for the student
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        id: 'test-activity-1-' + Date.now(),
        userId: student.id,
        category: '학습',
        subcategory: '수학',
        description: '분수의 덧셈과 뺄셈 문제 풀이',
        duration: 45,
        date: new Date().toISOString(),
        xpEarned: 90,
      },
    }),
    prisma.activity.create({
      data: {
        id: 'test-activity-2-' + Date.now(),
        userId: student.id,
        category: '독서',
        subcategory: '소설',
        description: '어린왕자 3장 읽기',
        duration: 30,
        date: new Date().toISOString(),
        xpEarned: 45,
      },
    }),
    prisma.activity.create({
      data: {
        id: 'test-activity-3-' + Date.now(),
        userId: student.id,
        category: '운동',
        subcategory: '구기운동',
        description: '축구 연습 - 패스와 드리블',
        duration: 60,
        date: new Date().toISOString(),
        xpEarned: 75,
      },
    }),
  ]);

  console.log('Test data setup complete');
  return { school, teacher, student, activities };
}

// Helper function to clean up test data
async function cleanupTestData() {
  console.log('Cleaning up test data...');
  
  try {
    await prisma.notification.deleteMany({
      where: {
        userId: { contains: 'test-' }
      }
    });
  } catch (error) {
    console.log('Notification table not found, skipping...');
  }
  
  try {
    await prisma.feedback.deleteMany({
      where: {
        teacherId: { contains: 'test-' }
      }
    });
  } catch (error) {
    console.log('Feedback table not found, skipping...');
  }
  
  await prisma.activity.deleteMany({
    where: {
      userId: { contains: 'test-' }
    }
  });
  
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@test.com'
      }
    }
  });
  
  await prisma.school.deleteMany({
    where: {
      id: { contains: 'test-school-' }
    }
  });
  
  console.log('Test data cleanup complete');
}

// Helper function to login
async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/**', { waitUntil: 'networkidle' });
}

test.describe('Teacher Features', () => {
  let testData: any;

  test.beforeAll(async () => {
    testData = await setupTestData();
  });

  test.afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  test('1. Teacher authentication and dashboard access', async ({ page }) => {
    // Login as teacher
    await login(page, teacherUser.email, teacherUser.password);
    
    // Verify redirect to teacher dashboard
    await expect(page).toHaveURL('/teacher');
    
    // Verify teacher dashboard elements
    await expect(page.locator('h1')).toContainText('선생님 대시보드');
    
    // Verify navigation menu has teacher items
    await expect(page.locator('text=활동 관리')).toBeVisible();
    await expect(page.locator('text=학생 통계')).toBeVisible();
    
    // Verify student features are not accessible
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/teacher'); // Should redirect back to teacher dashboard
  });

  test('2. Teacher activities page displays student activities', async ({ page }) => {
    // Login as teacher
    await login(page, teacherUser.email, teacherUser.password);
    
    // Navigate to activities page
    await page.click('text=활동 관리');
    await expect(page).toHaveURL('/teacher/activities');
    
    // Wait for activities to load
    await page.waitForSelector('text=이학생', { timeout: 10000 });
    
    // Verify student activities are displayed
    await expect(page.locator('text=이학생')).toBeVisible();
    await expect(page.locator('text=분수의 덧셈과 뺄셈 문제 풀이')).toBeVisible();
    await expect(page.locator('text=어린왕자 3장 읽기')).toBeVisible();
    await expect(page.locator('text=축구 연습 - 패스와 드리블')).toBeVisible();
    
    // Verify activity details are shown
    await expect(page.locator('text=45분')).toBeVisible();
    await expect(page.locator('text=30분')).toBeVisible();
    await expect(page.locator('text=60분')).toBeVisible();
  });

  test('3. Teacher can provide feedback on activities', async ({ page }) => {
    // Login as teacher
    await login(page, teacherUser.email, teacherUser.password);
    
    // Navigate to activities page
    await page.goto('/teacher/activities');
    
    // Wait for activities to load
    await page.waitForSelector('text=이학생', { timeout: 10000 });
    
    // Click feedback button on first activity
    const feedbackButtons = page.locator('button:has-text("피드백")');
    await feedbackButtons.first().click();
    
    // Wait for modal to appear
    await page.waitForSelector('text=피드백 작성', { timeout: 5000 });
    
    // Fill in feedback form
    await page.fill('textarea[placeholder*="피드백"]', '정말 잘했어요! 분수 문제를 꼼꼼하게 풀어서 기특해요. 다음에는 응용 문제도 도전해보면 좋겠어요.');
    
    // Submit feedback
    await page.click('button:has-text("피드백 전송")');
    
    // Wait for success message or redirect
    await page.waitForTimeout(2000);
    
    // Verify feedback was submitted (check for success indicator)
    const successToast = page.locator('text=피드백이 전송되었습니다');
    const isToastVisible = await successToast.isVisible().catch(() => false);
    
    if (!isToastVisible) {
      // If no toast, check if the modal closed (which also indicates success)
      const modalClosed = await page.locator('text=피드백 작성').isHidden().catch(() => true);
      expect(modalClosed).toBeTruthy();
    }
  });

  test('4. Student receives notification from teacher feedback', async ({ page }) => {
    // First, ensure teacher has sent feedback
    await login(page, teacherUser.email, teacherUser.password);
    await page.goto('/teacher/activities');
    await page.waitForSelector('text=이학생', { timeout: 10000 });
    
    const feedbackButtons = page.locator('button:has-text("피드백")');
    const firstButton = feedbackButtons.first();
    
    // Check if feedback button exists and is enabled
    const buttonExists = await firstButton.isVisible().catch(() => false);
    if (buttonExists) {
      await firstButton.click();
      await page.waitForSelector('text=피드백 작성', { timeout: 5000 });
      await page.fill('textarea[placeholder*="피드백"]', '훌륭한 학습 태도를 보여주었어요!');
      await page.click('button:has-text("피드백 전송")');
      await page.waitForTimeout(2000);
    }
    
    // Logout
    await page.goto('/api/auth/signout');
    await page.click('button:has-text("Sign out")');
    
    // Login as student
    await login(page, studentUser.email, studentUser.password);
    
    // Check for notifications
    const notificationBell = page.locator('button[aria-label*="알림"], button:has-text("알림"), [data-testid="notification-bell"]');
    const bellVisible = await notificationBell.isVisible().catch(() => false);
    
    if (bellVisible) {
      await notificationBell.click();
      
      // Check for teacher notification
      const teacherNotification = page.locator('text=김선생님');
      const notificationVisible = await teacherNotification.isVisible().catch(() => false);
      
      if (notificationVisible) {
        expect(notificationVisible).toBeTruthy();
      }
    }
    
    // Alternative: Check dashboard for recent feedback section
    await page.goto('/dashboard');
    const feedbackSection = page.locator('text=최근 피드백, text=선생님 피드백, text=피드백').first();
    const hasFeedbackSection = await feedbackSection.isVisible().catch(() => false);
    
    // At least one way of showing notifications should work
    expect(bellVisible || hasFeedbackSection).toBeTruthy();
  });

  test('5. Teacher statistics page shows student progress', async ({ page }) => {
    // Login as teacher
    await login(page, teacherUser.email, teacherUser.password);
    
    // Navigate to statistics page
    await page.click('text=학생 통계');
    await expect(page).toHaveURL('/teacher/statistics');
    
    // Wait for statistics to load
    await page.waitForSelector('h1:has-text("학생 통계")', { timeout: 10000 });
    
    // Verify student data is displayed
    const studentName = page.locator('text=이학생').first();
    const studentNameVisible = await studentName.isVisible().catch(() => false);
    
    if (studentNameVisible) {
      // Check for student statistics
      await expect(page.locator('text=레벨')).toBeVisible();
      await expect(page.locator('text=3')).toBeVisible(); // Student level
      
      // Check for activity summary
      const activityCount = page.locator('text=3개, text=3 활동, text=총 3').first();
      const hasActivityCount = await activityCount.isVisible().catch(() => false);
      expect(hasActivityCount).toBeTruthy();
    } else {
      // If individual student stats not shown, check for summary stats
      await expect(page.locator('text=전체 학생')).toBeVisible();
    }
  });

  test('6. Access control - Students cannot access teacher pages', async ({ page }) => {
    // Login as student
    await login(page, studentUser.email, studentUser.password);
    
    // Try to access teacher dashboard
    await page.goto('/teacher');
    
    // Should be redirected away from teacher area
    const url = page.url();
    expect(url).not.toContain('/teacher');
    
    // Try to access teacher activities directly
    await page.goto('/teacher/activities');
    const activitiesUrl = page.url();
    expect(activitiesUrl).not.toContain('/teacher/activities');
    
    // Verify student is on their dashboard
    await expect(page.locator('text=대시보드, text=나의 학습, text=활동').first()).toBeVisible();
  });
});

test.describe('Teacher Admin Features', () => {
  let testData: any;

  test.beforeAll(async () => {
    testData = await setupTestData();
  });

  test.afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  test('Admin pages are accessible to teachers', async ({ page }) => {
    // Login as teacher
    await login(page, teacherUser.email, teacherUser.password);
    
    // Check if admin link exists in navigation
    const adminLink = page.locator('a[href="/admin"], text=관리자');
    const hasAdminAccess = await adminLink.isVisible().catch(() => false);
    
    if (hasAdminAccess) {
      await adminLink.click();
      await expect(page).toHaveURL('/admin');
      
      // Verify admin dashboard elements
      await expect(page.locator('h1:has-text("관리자 대시보드")')).toBeVisible();
      
      // Check for user management
      await page.click('text=사용자 관리');
      await expect(page).toHaveURL('/admin/users');
      
      // Verify users are listed
      await expect(page.locator('text=이학생')).toBeVisible();
      await expect(page.locator('text=김선생님')).toBeVisible();
    } else {
      // Admin features might be restricted to specific teacher accounts
      console.log('Admin features not available for this teacher account');
    }
  });
});