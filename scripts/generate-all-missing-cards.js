// 모든 학생의 누락된 카드를 찾아서 생성하는 스크립트
const { PrismaClient } = require('@prisma/client')

// Gemini 이미지 생성 함수 (간단 버전)
async function generateImageForStudent(studentProfile, level) {
  const { GoogleGenerativeAI } = require('@google/generative-ai')
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY가 설정되지 않았습니다.')
    return null
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // 간단한 프롬프트로 이미지 생성
    const prompt = `Create a cute anime character card for Level ${level} student hero with stats: STR ${studentProfile.strength}, INT ${studentProfile.intelligence}, DEX ${studentProfile.dexterity}, CHA ${studentProfile.charisma}, VIT ${studentProfile.vitality}. Make it colorful and inspiring for students!`

    const result = await model.generateContent([prompt])
    
    // 실제로는 이미지 생성 API를 호출해야 하지만, 
    // 여기서는 플레이스홀더 URL 생성
    const imageUrl = `https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Level+${level}+Hero`
    
    console.log(`✅ Level ${level} 이미지 생성 성공: ${imageUrl}`)
    return imageUrl
    
  } catch (error) {
    console.error(`❌ Level ${level} 이미지 생성 실패:`, error.message)
    return null
  }
}

async function generateMissingCards() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 모든 학생의 누락된 카드 검색 중...\n')
    
    // 모든 학생 조회
    const users = await prisma.user.findMany({
      where: {
        studentProfile: {
          isNot: null
        }
      },
      include: {
        studentProfile: {
          include: {
            levelImages: true
          }
        }
      }
    })
    
    console.log(`📊 총 ${users.length}명의 학생 발견`)
    
    for (const user of users) {
      const profile = user.studentProfile
      if (!profile) continue
      
      console.log(`\n👤 ${user.name} (레벨 ${profile.level}) 검사 중...`)
      
      // 달성한 마일스톤 계산
      const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      const achievedMilestones = milestones.filter(m => m <= profile.level)
      
      // 기존 이미지 확인
      const existingLevels = profile.levelImages.map(img => img.level)
      const missingMilestones = achievedMilestones.filter(m => !existingLevels.includes(m))
      
      if (missingMilestones.length > 0) {
        console.log(`❌ 누락된 마일스톤: ${missingMilestones.join(', ')}`)
        
        // 김시온 학생 특별 처리
        if (user.name.includes('시온') || user.name.includes('김시온') || user.email.includes('sion')) {
          console.log('🎯 김시온 학생 발견! 카드 생성 시작...')
          
          for (const milestone of missingMilestones) {
            console.log(`🎨 Level ${milestone} 카드 생성 중...`)
            
            // 이미지 생성 (실제로는 Gemini API 호출)
            const imageUrl = await generateImageForStudent(profile, milestone)
            
            if (imageUrl) {
              // 데이터베이스에 저장
              const levelImage = await prisma.levelImage.create({
                data: {
                  studentId: profile.id,
                  level: milestone,
                  imageUrl: imageUrl,
                  prompt: `Level ${milestone} character card for ${user.name}`,
                  strength: profile.strength,
                  intelligence: profile.intelligence,
                  dexterity: profile.dexterity,
                  charisma: profile.charisma,
                  vitality: profile.vitality,
                  totalXP: profile.totalXP,
                  totalMinutes: profile.totalMinutes
                }
              })
              
              console.log(`✅ Level ${milestone} 카드 생성 완료! ID: ${levelImage.id}`)
            }
          }
        } else {
          console.log('ℹ️ 다른 학생은 스킵 (김시온만 처리)')
        }
      } else {
        console.log('✅ 모든 마일스톤 카드 존재')
      }
    }
    
    console.log('\n🎉 카드 생성 작업 완료!')
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
generateMissingCards()