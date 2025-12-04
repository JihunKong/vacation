const { PrismaClient } = require('@prisma/client')

async function updateKimSionCard() {
  console.log('🔄 김시온 학생의 카드를 스펙타큘러 바나나 스칼라로 업데이트 중...\n')
  
  const prisma = new PrismaClient()
  
  try {
    // Find Kim Sion's user by email
    const user = await prisma.user.findUnique({
      where: { email: 'kimsion70823@gmail.com' },
      include: { studentProfile: true }
    })
    
    if (!user || !user.studentProfile) {
      console.log('❌ 김시온 학생을 찾을 수 없습니다.')
      return
    }
    
    console.log(`👤 김시온 학생 발견: ${user.name} (레벨 ${user.studentProfile.level})`)
    
    // Find existing level 10 card
    const existingCard = await prisma.levelImage.findFirst({
      where: {
        studentId: user.studentProfile.id,
        level: 10
      }
    })
    
    if (existingCard) {
      console.log(`🎴 기존 레벨 10 카드 발견: ${existingCard.imageUrl}`)
      
      // Update with spectacular banana scholar
      const updatedCard = await prisma.levelImage.update({
        where: { id: existingCard.id },
        data: {
          imageUrl: '/level-cards/kim-sion-banana-scholar-spectacular.svg',
          prompt: 'Spectacular Banana Scholar Level 10 - Cool and flashy banana character with magical academic powers, wearing wizard robes and hat, holding magical staff and floating books, with bronze theme and sparkling effects'
        }
      })
      
      console.log('✅ 카드 업데이트 완료!')
      console.log(`🖼️ 새 이미지 URL: ${updatedCard.imageUrl}`)
      console.log(`📝 새 프롬프트: ${updatedCard.prompt}`)
    } else {
      console.log('❌ 레벨 10 카드를 찾을 수 없습니다.')
    }
    
  } catch (error) {
    console.error('💥 오류 발생:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

updateKimSionCard()
  .then(() => {
    console.log('\n🎉 김시온 스펙타큘러 바나나 스칼라 카드 업데이트 완료!')
  })
  .catch(error => {
    console.error('💥 스크립트 실행 오류:', error)
  })