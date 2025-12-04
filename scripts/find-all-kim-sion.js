const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findAllKimSionAccounts() {
  try {
    console.log('🔍 전체 사용자 중에서 김시온 관련 계정 찾는 중...\n')
    
    // 모든 사용자 조회
    const allUsers = await prisma.user.findMany({
      include: {
        studentProfile: {
          include: {
            levelImages: true,
            activities: {
              take: 5,
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    })
    
    console.log(`📊 전체 사용자 수: ${allUsers.length}명\n`)
    
    // 김시온과 관련된 계정들 찾기
    const kimSionAccounts = allUsers.filter(user => 
      user.name.includes('시온') || 
      user.name.includes('김시온') ||
      user.name.toLowerCase().includes('sion') ||
      user.email.includes('sion') ||
      user.name.includes('Kim')
    )
    
    console.log(`🎯 김시온 관련 계정 ${kimSionAccounts.length}개 발견:\n`)
    
    kimSionAccounts.forEach((user, index) => {
      console.log(`--- 계정 ${index + 1} ---`)
      console.log(`👤 이름: ${user.name}`)
      console.log(`📧 이메일: ${user.email}`)
      console.log(`🆔 사용자 ID: ${user.id}`)
      
      if (user.studentProfile) {
        console.log(`📊 레벨: ${user.studentProfile.level}`)
        console.log(`⭐ 총 경험치: ${user.studentProfile.totalXP}`)
        console.log(`⏰ 총 학습시간: ${Math.floor(user.studentProfile.totalMinutes / 60)}시간`)
        console.log(`💪 능력치 - STR:${user.studentProfile.strength} INT:${user.studentProfile.intelligence} DEX:${user.studentProfile.dexterity} CHA:${user.studentProfile.charisma} VIT:${user.studentProfile.vitality}`)
        console.log(`🖼️ 레벨 이미지: ${user.studentProfile.levelImages.length}개`)
        console.log(`📝 최근 활동: ${user.studentProfile.activities.length}개`)
        
        if (user.studentProfile.activities.length > 0) {
          console.log(`📅 마지막 활동: ${user.studentProfile.activities[0].date.toISOString().split('T')[0]}`)
        }
        
        // 누락된 마일스톤 확인
        const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        const achievedMilestones = milestones.filter(m => m <= user.studentProfile.level)
        const existingLevels = user.studentProfile.levelImages.map(img => img.level)
        const missingMilestones = achievedMilestones.filter(m => !existingLevels.includes(m))
        
        if (missingMilestones.length > 0) {
          console.log(`❌ 누락된 마일스톤: ${missingMilestones.join(', ')}`)
        } else {
          console.log(`✅ 모든 마일스톤 이미지 존재`)
        }
      } else {
        console.log('📊 학생 프로필 없음')
      }
      console.log('')
    })
    
    // 활동이 가장 많은 계정 식별
    if (kimSionAccounts.length > 1) {
      console.log('🔥 활동량 기준 정렬:')
      const sortedByActivity = kimSionAccounts
        .filter(user => user.studentProfile)
        .sort((a, b) => b.studentProfile.totalXP - a.studentProfile.totalXP)
      
      sortedByActivity.forEach((user, index) => {
        console.log(`${index + 1}위: ${user.name} (${user.email}) - ${user.studentProfile.totalXP} XP`)
      })
      
      if (sortedByActivity.length > 0) {
        console.log(`\n🎯 가장 활동이 많은 계정: ${sortedByActivity[0].name} (${sortedByActivity[0].email})`)
        return sortedByActivity[0]
      }
    } else if (kimSionAccounts.length === 1) {
      console.log(`\n🎯 김시온 계정: ${kimSionAccounts[0].name} (${kimSionAccounts[0].email})`)
      return kimSionAccounts[0]
    } else {
      console.log('\n❌ 김시온 계정을 찾을 수 없습니다.')
      
      // 전체 사용자 목록 출력 (이름에 한글이 포함된 것들)
      console.log('\n📋 한글 이름 사용자들:')
      allUsers.forEach(user => {
        if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(user.name)) {
          console.log(`  - ${user.name} (${user.email})`)
        }
      })
      return null
    }
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

findAllKimSionAccounts()
  .then(result => {
    if (result && result.studentProfile) {
      console.log('\n✨ 결론: 위 계정이 메인 김시온 계정입니다.')
    }
  })
  .catch(console.error)