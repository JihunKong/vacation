const https = require('https');

async function findKimSionInfo() {
  console.log('🔍 김시온 학생 정보 조회 중...\n');

  // 관리자 API로 사용자 목록 조회
  const options = {
    hostname: 'xn--oj4b21j.com',
    port: 443,
    path: '/api/admin/users',
    method: 'GET',
    headers: {
      'Cookie': 'next-auth.session-token=your-admin-session', // 실제로는 관리자 세션 필요
      'User-Agent': 'Mozilla/5.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.users) {
            const kimSion = response.users.find(user => 
              user.name.includes('시온') || 
              user.name.includes('김시온') || 
              user.email.includes('sion')
            );
            
            if (kimSion) {
              console.log('✅ 김시온 학생 발견!');
              console.log('📧 이메일:', kimSion.email);
              console.log('👤 이름:', kimSion.name);
              console.log('🆔 사용자 ID:', kimSion.id);
              if (kimSion.studentProfile) {
                console.log('📊 레벨:', kimSion.studentProfile.level);
                console.log('⭐ 경험치:', kimSion.studentProfile.totalXP);
              }
              resolve(kimSion);
            } else {
              console.log('❌ 김시온 학생을 찾을 수 없습니다.');
              console.log('📋 전체 사용자 목록:');
              response.users.forEach(user => {
                console.log(`  - ${user.name} (${user.email})`);
              });
              resolve(null);
            }
          } else {
            console.log('📄 Raw 응답:', data);
            resolve(null);
          }
        } catch (error) {
          console.log('📄 Raw 응답:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 요청 오류:', error);
      reject(error);
    });

    req.end();
  });
}

// 더 간단한 방법: 데이터베이스 직접 쿼리
async function findKimSionDirect() {
  console.log('🔍 데이터베이스에서 김시온 학생 검색...\n');
  
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany({
      include: {
        studentProfile: true
      }
    });
    
    console.log('📋 전체 사용자 목록:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - 레벨: ${user.studentProfile?.level || 'N/A'}`);
    });
    
    const kimSion = users.find(user => 
      user.name.includes('시온') || 
      user.name.includes('김시온') || 
      user.email.includes('sion') ||
      user.name.toLowerCase().includes('sion')
    );
    
    if (kimSion && kimSion.studentProfile) {
      console.log('\n✅ 김시온 학생 발견!');
      console.log('👤 이름:', kimSion.name);
      console.log('📧 이메일:', kimSion.email);
      console.log('🆔 사용자 ID:', kimSion.id);
      console.log('🎓 프로필 ID:', kimSion.studentProfile.id);
      console.log('📊 레벨:', kimSion.studentProfile.level);
      console.log('⭐ 경험치:', kimSion.studentProfile.totalXP);
      console.log('💪 힘:', kimSion.studentProfile.strength);
      console.log('🧠 지능:', kimSion.studentProfile.intelligence);
      
      // 기존 이미지 확인
      const existingImages = await prisma.levelImage.findMany({
        where: { studentId: kimSion.studentProfile.id },
        orderBy: { level: 'asc' }
      });
      
      console.log('🖼️ 기존 이미지:', existingImages.map(img => `${img.level}레벨`).join(', ') || '없음');
      
      // 생성되어야 할 마일스톤
      const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const achievedMilestones = milestones.filter(m => m <= kimSion.studentProfile.level);
      const missingMilestones = achievedMilestones.filter(m => !existingImages.find(img => img.level === m));
      
      if (missingMilestones.length > 0) {
        console.log('❌ 누락된 마일스톤:', missingMilestones.join(', '));
        return { user: kimSion, missingMilestones };
      } else {
        console.log('✅ 모든 마일스톤 이미지 존재');
        return { user: kimSion, missingMilestones: [] };
      }
    } else {
      console.log('❌ 김시온 학생을 찾을 수 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('💥 오류:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
findKimSionDirect()
  .then(result => {
    if (result && result.missingMilestones.length > 0) {
      console.log('\n🎯 다음 단계: 누락된 마일스톤 이미지 생성');
      console.log('💡 명령어: node generate-missing-cards.js');
    }
  })
  .catch(console.error);