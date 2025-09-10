const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkKimSion() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: '김시온' },
          { name: 'Kim Sion' },
          { email: { contains: 'sion' } }
        ]
      },
      include: {
        studentProfile: true
      }
    })
    
    if (user?.studentProfile) {
      console.log('김시온 학생 정보:')
      console.log('이름:', user.name)
      console.log('이메일:', user.email)
      console.log('레벨:', user.studentProfile.level)
      console.log('경험치:', user.studentProfile.totalXP)
      
      const images = await prisma.levelImage.findMany({
        where: { studentId: user.studentProfile.id },
        orderBy: { level: 'asc' }
      })
      
      console.log('생성된 이미지:', images.map(img => `${img.level}레벨`).join(', ') || '없음')
      
      // 10레벨 단위로 생성되어야 할 이미지들
      const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      const achievedMilestones = milestones.filter(m => m <= user.studentProfile.level)
      const missingMilestones = achievedMilestones.filter(m => !images.find(img => img.level === m))
      
      if (missingMilestones.length > 0) {
        console.log('누락된 마일스톤 이미지:', missingMilestones.join(', '))
      } else {
        console.log('모든 마일스톤 이미지가 생성되어 있습니다.')
      }
    } else {
      console.log('김시온 학생을 찾을 수 없습니다.')
    }
  } catch (error) {
    console.error('오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkKimSion()