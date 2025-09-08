import { PrismaClient } from '@prisma/client'
import { generateLevelImage, CharacterStats } from '../lib/gemini'

const prisma = new PrismaClient()

async function generateKimSionCard() {
  console.log('=== 김시온 학생 레벨 카드 생성 ===\n')

  try {
    // 김시온 학생 찾기
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

    if (!user || !user.studentProfile) {
      console.error('김시온 학생을 찾을 수 없습니다.')
      return
    }

    console.log(`학생 발견: ${user.name} (${user.email})`)
    console.log(`현재 레벨: ${user.studentProfile!.level}`)
    console.log(`스텟 - STR: ${user.studentProfile!.strength}, INT: ${user.studentProfile!.intelligence}, DEX: ${user.studentProfile!.dexterity}, CHA: ${user.studentProfile!.charisma}, VIT: ${user.studentProfile!.vitality}`)

    // 10레벨 단위 체크
    const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    const currentMilestones = milestones.filter(m => m <= user.studentProfile!.level)

    if (currentMilestones.length === 0) {
      console.log('아직 10레벨에 도달하지 않았습니다.')
      return
    }

    console.log(`달성한 마일스톤: ${currentMilestones.join(', ')}`)

    // 각 마일스톤별 이미지 확인 및 생성
    for (const milestone of currentMilestones) {
      const existingImage = await prisma.levelImage.findFirst({
        where: {
          studentId: user.studentProfile.id,
          level: milestone
        }
      })

      if (existingImage) {
        console.log(`✅ ${milestone}레벨 이미지 이미 존재`)
        continue
      }

      console.log(`\n${milestone}레벨 이미지 생성 중...`)

      try {
        // CharacterStats 객체 생성 - milestone 레벨로 설정
        const stats: CharacterStats = {
          level: milestone,  // 마일스톤 레벨로 설정
          strength: user.studentProfile.strength,
          intelligence: user.studentProfile.intelligence,
          dexterity: user.studentProfile.dexterity,
          charisma: user.studentProfile.charisma,
          vitality: user.studentProfile.vitality,
          totalXP: user.studentProfile.totalXP,
          totalMinutes: user.studentProfile.totalMinutes,
          name: user.name || undefined
        }

        // 이미지 생성
        const result = await generateLevelImage(stats)

        if (!result.success || !result.imageUrl) {
          console.error(`❌ ${milestone}레벨 이미지 생성 실패: ${result.error}`)
          continue
        }

        // 데이터베이스에 저장
        const savedImage = await prisma.levelImage.create({
          data: {
            studentId: user.studentProfile.id,
            level: milestone,
            imageUrl: result.imageUrl!,
            prompt: `Level ${milestone} character card`,
            stats: {
              level: user.studentProfile.level,
              strength: user.studentProfile.strength,
              intelligence: user.studentProfile.intelligence,
              dexterity: user.studentProfile.dexterity,
              charisma: user.studentProfile.charisma,
              vitality: user.studentProfile.vitality
            }
          }
        })

        console.log(`✅ ${milestone}레벨 이미지 생성 및 저장 완료`)
        console.log(`   이미지 URL: ${savedImage.imageUrl}`)
      } catch (error) {
        console.error(`❌ ${milestone}레벨 이미지 생성 중 오류:`, error)
      }
    }

    console.log('\n=== 이미지 생성 완료 ===')
    console.log('갤러리에서 확인할 수 있습니다.')

  } catch (error) {
    console.error('오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
generateKimSionCard().catch(console.error)