import { PrismaClient, Category } from '@prisma/client'

const prisma = new PrismaClient()

// 카테고리별 스텟 매핑
const CATEGORY_STAT_MAP: Record<Category, string> = {
  [Category.EXERCISE]: 'strength',      // 운동 → 힘
  [Category.STUDY]: 'intelligence',     // 학습 → 지능
  [Category.READING]: 'intelligence',   // 독서 → 지능
  [Category.HOBBY]: 'dexterity',       // 취미 → 민첩성
  [Category.VOLUNTEER]: 'charisma',    // 봉사 → 매력
  [Category.OTHER]: 'vitality',        // 기타 → 활력
}

async function recalculateAllStats() {
  console.log('=== 전체 학생 스텟 재계산 (기본 스텟 10) ===\n')

  try {
    // 모든 학생 프로필 조회
    const students = await prisma.studentProfile.findMany({
      include: {
        user: true,
        activities: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    console.log(`총 ${students.length}명의 학생 발견\n`)

    for (const student of students) {
      console.log(`\n학생: ${student.user.name} (${student.user.email})`)
      console.log(`현재 레벨: ${student.level}`)
      console.log(`현재 스텟 - STR: ${student.strength}, INT: ${student.intelligence}, DEX: ${student.dexterity}, CHA: ${student.charisma}, VIT: ${student.vitality}`)
      
      // 기본 스텟 10에서 시작
      const newStats = {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        charisma: 10,
        vitality: 10
      }

      // 각 활동별로 스텟 추가 계산
      let totalXP = 0
      const categoryMinutes: Record<Category, number> = {
        [Category.STUDY]: 0,
        [Category.READING]: 0,
        [Category.EXERCISE]: 0,
        [Category.HOBBY]: 0,
        [Category.VOLUNTEER]: 0,
        [Category.OTHER]: 0,
      }

      for (const activity of student.activities) {
        categoryMinutes[activity.category] += activity.minutes
        totalXP += activity.xpEarned
        
        // 스텟 포인트 계산 (10 XP당 1 포인트)
        const statPoints = Math.floor(activity.xpEarned / 10)
        const statType = CATEGORY_STAT_MAP[activity.category]
        
        if (statType && statPoints > 0) {
          newStats[statType as keyof typeof newStats] += statPoints
        }
      }

      // 레벨업 보너스 스텟 추가 (레벨당 1포인트를 주요 활동 스텟에)
      if (student.activities.length > 0) {
        const mainCategory = Object.entries(categoryMinutes).reduce((a, b) => 
          categoryMinutes[a[0] as Category] > categoryMinutes[b[0] as Category] ? a : b
        )[0] as Category
        const mainStat = CATEGORY_STAT_MAP[mainCategory]
        const levelBonus = Math.floor(student.level / 2) // 2레벨당 1포인트
        newStats[mainStat as keyof typeof newStats] += levelBonus
      }

      // 스텟 상한선 적용 (레벨당 최대 2포인트 추가, 기본 10 + 레벨*2, 최대 100)
      const maxStatPerLevel = Math.min(10 + (student.level * 2), 100)
      Object.keys(newStats).forEach(stat => {
        newStats[stat as keyof typeof newStats] = Math.min(
          newStats[stat as keyof typeof newStats],
          maxStatPerLevel
        )
      })

      console.log(`재계산된 스텟 - STR: ${newStats.strength}, INT: ${newStats.intelligence}, DEX: ${newStats.dexterity}, CHA: ${newStats.charisma}, VIT: ${newStats.vitality}`)
      
      // 데이터베이스 업데이트
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: {
          strength: newStats.strength,
          intelligence: newStats.intelligence,
          dexterity: newStats.dexterity,
          charisma: newStats.charisma,
          vitality: newStats.vitality,
          totalXP: totalXP // XP도 재계산
        }
      })
      
      console.log('✅ 스텟 업데이트 완료')

      // 활동 카테고리별 시간 출력
      if (student.activities.length > 0) {
        console.log('\n활동 내역:')
        Object.entries(categoryMinutes).forEach(([category, minutes]) => {
          if (minutes > 0) {
            console.log(`  - ${category}: ${minutes}분 (${Math.floor(minutes/60)}시간 ${minutes%60}분)`)
          }
        })
      } else {
        console.log('활동 내역: 없음')
      }
    }

    console.log('\n=== 스텟 재계산 완료 ===')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 메인 실행
recalculateAllStats().catch(console.error)