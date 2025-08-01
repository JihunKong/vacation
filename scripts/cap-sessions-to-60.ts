// scripts/cap-sessions-to-60.ts
// 60분 초과 활동을 60분으로 제한하는 스크립트

import { PrismaClient } from "@prisma/client"
import { calculateLevel, calculateXP, calculateStatPoints } from "../lib/game/stats"

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

async function capSessionsTo60() {
  console.log("60분 초과 활동을 60분으로 제한하는 작업 시작...")

  try {
    // 1. 60분 초과 활동 조회
    const overLimitActivities = await prisma.activity.findMany({
      where: {
        minutes: { gt: 60 }
      },
      include: {
        student: true
      }
    })

    console.log(`\n60분 초과 활동 수: ${overLimitActivities.length}개`)

    // 2. 각 활동을 60분으로 제한
    let totalUpdated = 0
    
    for (const activity of overLimitActivities) {
      const oldMinutes = activity.minutes
      const oldXP = activity.xpEarned
      
      // 60분으로 제한
      const newMinutes = 60
      const hasStreak = false // 보수적으로 계산
      const newXP = calculateXP(newMinutes, activity.category, hasStreak)
      const newStatPoints = calculateStatPoints(newXP)
      
      // 활동 업데이트
      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          minutes: newMinutes,
          xpEarned: newXP,
          statPoints: {
            strength: 0,
            intelligence: 0,
            dexterity: 0,
            charisma: 0,
            vitality: 0,
            [activity.category === 'EXERCISE' ? 'strength' :
             activity.category === 'STUDY' || activity.category === 'READING' ? 'intelligence' :
             activity.category === 'HOBBY' ? 'dexterity' :
             activity.category === 'VOLUNTEER' ? 'charisma' : 'vitality']: newStatPoints
          }
        }
      })

      console.log(`✅ ${activity.id}: ${oldMinutes}분 → ${newMinutes}분, ${oldXP} XP → ${newXP} XP`)
      totalUpdated++
    }

    console.log(`\n총 ${totalUpdated}개의 활동이 60분으로 제한되었습니다.`)

    // 3. 모든 사용자의 총계 재계산
    console.log("\n사용자 프로필 재계산 시작...")
    
    const allProfiles = await prisma.studentProfile.findMany({
      include: {
        activities: true,
        user: true
      }
    })

    for (const profile of allProfiles) {
      // 실제 활동 기록 기반으로 재계산
      const totalMinutes = profile.activities.reduce((sum, act) => sum + act.minutes, 0)
      const totalXP = profile.activities.reduce((sum, act) => sum + act.xpEarned, 0)
      
      // 능력치 재계산
      const stats = {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        charisma: 10,
        vitality: 10
      }

      profile.activities.forEach(activity => {
        if (activity.statPoints && typeof activity.statPoints === 'object') {
          const actStats = activity.statPoints as any
          Object.keys(stats).forEach(stat => {
            if (actStats[stat]) {
              stats[stat as keyof typeof stats] += actStats[stat]
            }
          })
        }
      })

      // 레벨 계산
      const { level, currentXP, requiredXP } = calculateLevel(totalXP)

      // 업데이트가 필요한 경우만 처리
      if (profile.totalMinutes !== totalMinutes || 
          profile.totalXP !== totalXP ||
          profile.level !== level ||
          profile.experience !== currentXP ||
          profile.strength !== stats.strength ||
          profile.intelligence !== stats.intelligence ||
          profile.dexterity !== stats.dexterity ||
          profile.charisma !== stats.charisma ||
          profile.vitality !== stats.vitality) {
        
        await prisma.studentProfile.update({
          where: { id: profile.id },
          data: {
            totalMinutes,
            totalXP,
            level,
            experience: currentXP,
            xpForNextLevel: requiredXP,
            strength: stats.strength,
            intelligence: stats.intelligence,
            dexterity: stats.dexterity,
            charisma: stats.charisma,
            vitality: stats.vitality
          }
        })

        console.log(`✅ ${profile.user.email} 프로필 재계산 완료`)
        console.log(`   - 총 시간: ${totalMinutes}분`)
        console.log(`   - 총 XP: ${totalXP}`)
        console.log(`   - 레벨: ${level}`)
      }
    }

    console.log("\n모든 작업 완료!")
  } catch (error) {
    console.error("오류 발생:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
capSessionsTo60()