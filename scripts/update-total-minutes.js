const { PrismaClient } = require('@prisma/client');

async function updateTotalMinutes() {
  const prisma = new PrismaClient();
  
  console.log('🔄 기존 사용자의 totalMinutes 업데이트 시작...\n');
  
  try {
    // 모든 학생 프로필 조회
    const studentProfiles = await prisma.studentProfile.findMany({
      include: {
        activities: true,
        user: true,
      },
    });
    
    console.log(`총 ${studentProfiles.length}명의 학생 발견\n`);
    
    for (const profile of studentProfiles) {
      // 각 학생의 모든 활동 시간 합계 계산
      const totalMinutes = profile.activities.reduce((sum, activity) => {
        return sum + activity.minutes;
      }, 0);
      
      // totalMinutes 업데이트
      await prisma.studentProfile.update({
        where: { id: profile.id },
        data: { totalMinutes },
      });
      
      console.log(`✅ ${profile.user.name || profile.user.email}: ${totalMinutes}분 업데이트 완료`);
    }
    
    console.log('\n✨ 모든 사용자의 totalMinutes 업데이트 완료!');
    
    // 업데이트 결과 확인
    console.log('\n📊 업데이트 결과:');
    const updatedProfiles = await prisma.studentProfile.findMany({
      orderBy: { totalMinutes: 'desc' },
      include: { user: true },
    });
    
    updatedProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.user.name || profile.user.email}: ${profile.totalMinutes}분`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// DATABASE_URL이 설정되어 있는지 확인
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL이 설정되지 않았습니다.');
  console.log('\n사용법:');
  console.log('DATABASE_URL="postgresql://..." node scripts/update-total-minutes.js');
  process.exit(1);
}

updateTotalMinutes();