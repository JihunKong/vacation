// scripts/fix-session-limit.ts
// 60분 초과 활동을 정리하고 비정상 데이터를 수정하는 스크립트

import { PrismaClient } from "@prisma/client"
import { calculateLevel, calculateXP } from "../lib/game/stats"

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

async function fixSessionLimit() {
  console.log("60분 초과 활동 데이터 정리 시작...")

  try {
    // 1. 60분 초과 활동 조회
    const overLimitActivities = await prisma.activity.findMany({
      where: {
        minutes: { gt: 60 }
      },
      include: {
        student: true
      },
      orderBy: {
        minutes: 'desc'
      }
    })

    console.log(`\n60분 초과 활동 수: ${overLimitActivities.length}개`)

    // 2. 각 활동 처리
    for (const activity of overLimitActivities) {
      console.log(`\n활동 ID ${activity.id} 처리 중...`)
      console.log(`- 학생: ${activity.student.userId}`)
      console.log(`- 원래 시간: ${activity.minutes}분`)
      console.log(`- 원래 XP: ${activity.xpEarned}`)

      // 매우 큰 시간은 합리적으로 제한 (하루 최대 8시간 = 480분)
      const cappedMinutes = Math.min(activity.minutes, 480)
      
      // 60분 단위로 분할할 세션 수 계산
      const sessions = Math.ceil(cappedMinutes / 60)
      const minutesPerSession = Math.floor(cappedMinutes / sessions)
      const remainingMinutes = cappedMinutes % sessions

      console.log(`- 제한된 시간: ${cappedMinutes}분`)
      console.log(`- 분할될 세션 수: ${sessions}개`)

      // 원본 활동을 첫 번째 세션으로 업데이트
      const firstSessionMinutes = minutesPerSession + (remainingMinutes > 0 ? 1 : 0)
      const firstSessionXP = calculateXP(firstSessionMinutes, activity.category, false)
      
      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          minutes: firstSessionMinutes,
          xpEarned: firstSessionXP,
          title: `${activity.title} (1/${sessions})`
        }
      })

      // 추가 세션들 생성
      for (let i = 1; i < sessions; i++) {
        const sessionMinutes = minutesPerSession + (i < remainingMinutes ? 1 : 0)
        const sessionXP = calculateXP(sessionMinutes, activity.category, false)
        
        await prisma.activity.create({
          data: {
            studentId: activity.studentId,
            title: `${activity.title} (${i + 1}/${sessions})`,
            description: activity.description,
            category: activity.category,
            minutes: sessionMinutes,
            date: activity.date,
            xpEarned: sessionXP,
            statPoints: activity.statPoints,
          }
        })
      }

      console.log(`✅ ${sessions}개 세션으로 분할 완료`)
    }

    // 3. 특정 사용자의 비정상 데이터 처리
    console.log("\n비정상적으로 높은 데이터 처리...")
    
    // 총 활동 시간이 1년치(525,600분) 이상인 사용자 찾기
    const abnormalProfiles = await prisma.studentProfile.findMany({
      where: {
        totalMinutes: { gt: 525600 } // 1년 = 365일 * 24시간 * 60분
      },
      include: {
        user: true,
        activities: true
      }
    })

    for (const profile of abnormalProfiles) {
      console.log(`\n비정상 프로필 처리: ${profile.user.email}`)
      console.log(`- 원래 총 시간: ${profile.totalMinutes}분 (${Math.floor(profile.totalMinutes / 60 / 24)}일)`)
      
      // 합리적인 수준으로 조정 (1일 평균 4시간, 180일 = 6개월)
      const reasonableMinutes = 4 * 60 * 180 // 43,200분
      const scaleFactor = reasonableMinutes / profile.totalMinutes

      // 모든 활동 시간을 비례적으로 축소
      const activities = await prisma.activity.findMany({
        where: { studentId: profile.id }
      })

      let newTotalMinutes = 0
      let newTotalXP = 0

      for (const activity of activities) {
        const newMinutes = Math.max(10, Math.min(60, Math.floor(activity.minutes * scaleFactor)))
        const newXP = calculateXP(newMinutes, activity.category, false)
        
        await prisma.activity.update({
          where: { id: activity.id },
          data: {
            minutes: newMinutes,
            xpEarned: newXP
          }
        })

        newTotalMinutes += newMinutes
        newTotalXP += newXP
      }

      // 프로필 업데이트
      const { level, currentXP, requiredXP } = calculateLevel(newTotalXP)
      
      await prisma.studentProfile.update({
        where: { id: profile.id },
        data: {
          totalMinutes: newTotalMinutes,
          totalXP: newTotalXP,
          level,
          experience: currentXP,
          xpForNextLevel: requiredXP,
          // 능력치도 비례적으로 조정
          strength: Math.max(10, Math.floor(profile.strength * scaleFactor)),
          intelligence: Math.max(10, Math.floor(profile.intelligence * scaleFactor)),
          dexterity: Math.max(10, Math.floor(profile.dexterity * scaleFactor)),
          charisma: Math.max(10, Math.floor(profile.charisma * scaleFactor)),
          vitality: Math.max(10, Math.floor(profile.vitality * scaleFactor)),
        }
      })

      console.log(`✅ 조정 완료:`)
      console.log(`   - 새 총 시간: ${newTotalMinutes}분 (${Math.floor(newTotalMinutes / 60 / 24)}일)`)
      console.log(`   - 새 총 XP: ${newTotalXP}`)
      console.log(`   - 새 레벨: ${level}`)
    }

    console.log("\n모든 데이터 정리 완료!")
  } catch (error) {
    console.error("오류 발생:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
fixSessionLimit()