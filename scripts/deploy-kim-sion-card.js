const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deployKimSionCard() {
  console.log('🎯 김시온 학생 10레벨 카드 데이터베이스 삽입 시작...\n')
  
  try {
    // 1. 김시온 학생 찾기
    console.log('🔍 김시온 학생 계정 확인 중...')
    const user = await prisma.user.findUnique({
      where: { email: 'kimsion70823@gmail.com' },
      include: {
        studentProfile: {
          include: {
            levelImages: true
          }
        }
      }
    })
    
    if (!user) {
      console.log('❌ kimsion70823@gmail.com 사용자를 찾을 수 없습니다.')
      return
    }
    
    if (!user.studentProfile) {
      console.log('❌ 김시온 학생의 프로필을 찾을 수 없습니다.')
      return
    }
    
    console.log('✅ 김시온 학생 확인 완료:')
    console.log(`   👤 이름: ${user.name}`)
    console.log(`   📧 이메일: ${user.email}`)
    console.log(`   📊 레벨: ${user.studentProfile.level}`)
    console.log(`   🆔 프로필 ID: ${user.studentProfile.id}`)
    
    // 2. 기존 10레벨 카드 확인
    const existing10LevelCard = user.studentProfile.levelImages.find(img => img.level === 10)
    
    if (existing10LevelCard) {
      console.log('\n⚠️  10레벨 카드가 이미 존재합니다:')
      console.log(`   🖼️ 이미지 URL: ${existing10LevelCard.imageUrl}`)
      console.log(`   📅 생성일: ${existing10LevelCard.createdAt}`)
      console.log('\n🔄 기존 카드를 새로 생성된 카드로 교체합니다...')
      
      // 기존 카드 삭제
      await prisma.levelImage.delete({
        where: { id: existing10LevelCard.id }
      })
      console.log('✅ 기존 카드 삭제 완료')
    } else {
      console.log('\n📋 10레벨 카드가 없음 - 새로 생성합니다.')
    }
    
    // 3. 새 10레벨 카드 생성
    console.log('\n🎨 새 10레벨 카드 생성 중...')
    
    const newCard = await prisma.levelImage.create({
      data: {
        studentId: user.studentProfile.id,
        level: 10,
        imageUrl: '/level-cards/kim-sion-level-10-1757486919979.svg',
        prompt: 'Create a high-quality anime/manga style character card for a Level 10 student. Character Details: Apple Scholar - cute apple character with student accessories, Class: Arcane Scholar, Style: magical aura, glowing books, mystical symbols, scholarly accessories. Stats: STR 15 | INT 127 | DEX 12 | CHA 14 | VIT 16. Korean webtoon/manhwa art style with bronze theme and fantasy academy background.',
        strength: user.studentProfile.strength,
        intelligence: user.studentProfile.intelligence,
        dexterity: user.studentProfile.dexterity,
        charisma: user.studentProfile.charisma,
        vitality: user.studentProfile.vitality,
        totalXP: user.studentProfile.totalXP,
        totalMinutes: user.studentProfile.totalMinutes
      }
    })
    
    console.log('✅ 10레벨 카드 생성 완료!')
    console.log(`   🆔 카드 ID: ${newCard.id}`)
    console.log(`   🖼️ 이미지 URL: ${newCard.imageUrl}`)
    console.log(`   📊 능력치: STR:${newCard.strength} INT:${newCard.intelligence} DEX:${newCard.dexterity} CHA:${newCard.charisma} VIT:${newCard.vitality}`)
    console.log(`   ⭐ 경험치: ${newCard.totalXP} XP`)
    console.log(`   ⏰ 학습시간: ${Math.floor(newCard.totalMinutes / 60)}시간`)
    
    // 4. 생성된 모든 카드 확인
    const allCards = await prisma.levelImage.findMany({
      where: { studentId: user.studentProfile.id },
      orderBy: { level: 'asc' }
    })
    
    console.log('\n📋 김시온 학생의 모든 레벨 카드:')
    allCards.forEach(card => {
      console.log(`   🎯 Level ${card.level} - ${card.imageUrl} (${card.createdAt.toISOString().split('T')[0]})`)
    })
    
    console.log('\n🎉 김시온 학생 10레벨 카드 배포 완료!')
    console.log('💡 이제 김시온 학생이 갤러리에서 10레벨 카드를 확인할 수 있습니다.')
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
deployKimSionCard()