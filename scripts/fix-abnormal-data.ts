// scripts/fix-abnormal-data.ts
// 비정상적인 데이터를 수정하는 스크립트

import { PrismaClient } from "@prisma/client"
import { calculateLevel } from "../lib/game/stats"

// DATABASE_URL이 설정되어 있지 않으면 에러
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL이 설정되지 않았습니다.")
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function fixAbnormalData() {
  console.log("비정상 데이터 수정 시작...")

  try {
    // 1. 모든 학생 프로필 가져오기
    const studentProfiles = await prisma.studentProfile.findMany({
      include: {
        activities: true,
      },
    })

    for (const profile of studentProfiles) {
      console.log(`\n${profile.id} 프로필 검사 중...`)
      
      // 2. 실제 활동 기반으로 총 XP 재계산
      const actualTotalXP = profile.activities.reduce((sum, activity) => {
        return sum + activity.xpEarned
      }, 0)

      // 3. 실제 활동 시간 재계산
      const actualTotalMinutes = profile.activities.reduce((sum, activity) => {
        return sum + activity.minutes
      }, 0)

      // 4. 올바른 레벨과 경험치 계산
      const { level, currentXP, requiredXP } = calculateLevel(actualTotalXP)

      // 5. 능력치 재계산
      const statTotals = {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        charisma: 10,
        vitality: 10,
      }

      profile.activities.forEach(activity => {
        if (activity.statPoints && typeof activity.statPoints === 'object') {
          const stats = activity.statPoints as any
          Object.keys(statTotals).forEach(stat => {
            if (stats[stat]) {
              statTotals[stat as keyof typeof statTotals] += stats[stat]
            }
          })
        }
      })

      // 6. 데이터 비교 및 수정
      const needsUpdate = 
        profile.totalXP !== actualTotalXP ||
        profile.totalMinutes !== actualTotalMinutes ||
        profile.level !== level ||
        profile.experience !== currentXP ||
        profile.xpForNextLevel !== requiredXP ||
        profile.strength !== statTotals.strength ||
        profile.intelligence !== statTotals.intelligence ||
        profile.dexterity !== statTotals.dexterity ||
        profile.charisma !== statTotals.charisma ||
        profile.vitality !== statTotals.vitality

      if (needsUpdate) {
        console.log(`수정 필요: 
          - 총 XP: ${profile.totalXP} → ${actualTotalXP}
          - 총 시간: ${profile.totalMinutes} → ${actualTotalMinutes}분
          - 레벨: ${profile.level} → ${level}
          - 현재 경험치: ${profile.experience} → ${currentXP}
          - 다음 레벨 필요 XP: ${profile.xpForNextLevel} → ${requiredXP}`)

        // 데이터베이스 업데이트
        await prisma.studentProfile.update({
          where: { id: profile.id },
          data: {
            totalXP: actualTotalXP,
            totalMinutes: actualTotalMinutes,
            level,
            experience: currentXP,
            xpForNextLevel: requiredXP,
            strength: statTotals.strength,
            intelligence: statTotals.intelligence,
            dexterity: statTotals.dexterity,
            charisma: statTotals.charisma,
            vitality: statTotals.vitality,
          },
        })

        console.log("✅ 수정 완료")
      } else {
        console.log("✅ 정상 데이터")
      }
    }

    console.log("\n모든 데이터 검사 및 수정 완료!")
  } catch (error) {
    console.error("오류 발생:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
fixAbnormalData()