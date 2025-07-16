const { PrismaClient } = require('@prisma/client');

async function checkTables() {
  const prisma = new PrismaClient();
  
  console.log('🔍 데이터베이스 테이블 확인 중...\n');
  
  try {
    // 각 테이블 확인
    const tables = [
      { name: 'User', check: () => prisma.user.count() },
      { name: 'StudentProfile', check: () => prisma.studentProfile.count() },
      { name: 'Plan', check: () => prisma.plan.count() },
      { name: 'PlanItem', check: () => prisma.planItem.count() },
      { name: 'Activity', check: () => prisma.activity.count() },
      { name: 'Badge', check: () => prisma.badge.count() },
      { name: 'Summary', check: () => prisma.summary.count() },
    ];
    
    for (const table of tables) {
      try {
        const count = await table.check();
        console.log(`✅ ${table.name} 테이블: ${count}개 레코드`);
      } catch (error) {
        console.log(`❌ ${table.name} 테이블: 존재하지 않음`);
      }
    }
    
    console.log('\n📊 데이터베이스 연결 정보:');
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '설정됨' : '설정되지 않음'}`);
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`- 호스트: ${url.hostname}`);
      console.log(`- 데이터베이스: ${url.pathname.slice(1)}`);
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();