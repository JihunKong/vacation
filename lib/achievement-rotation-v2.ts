import { prisma } from '@/lib/db'
import { getActiveAchievements, selectMonthlyRandomAchievements, allAchievements } from '@/lib/achievements-data'

// 현재 월의 활성 도전과제 가져오기
export async function getCurrentMonthAchievements() {
  const currentMonth = new Date().getMonth() + 1 // 1-12
  
  // DB에서 현재 월의 도전과제 가져오기
  const dbAchievements = await prisma.achievement.findMany({
    where: {
      OR: [
        { isMonthly: false }, // 항상 활성인 기본 도전과제
        { 
          AND: [
            { isMonthly: true },
            { activeMonth: currentMonth }
          ]
        }
      ]
    }
  })
  
  // DB에 도전과제가 없으면 초기화
  if (dbAchievements.length === 0) {
    await initializeAchievements()
    return getCurrentMonthAchievements()
  }
  
  return dbAchievements
}

// 도전과제 초기화 (첫 실행 또는 리셋 시)
export async function initializeAchievements() {
  const currentMonth = new Date().getMonth() + 1
  
  // 현재 월의 활성 도전과제 가져오기
  const activeAchievements = getActiveAchievements(currentMonth)
  
  // DB에 도전과제 추가
  for (const achievement of activeAchievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        difficulty: achievement.difficulty,
        xpReward: achievement.xpReward,
        target: achievement.target,
        checkType: achievement.checkType,
        checkCondition: achievement.checkCondition || {},
        isMonthly: achievement.isMonthly || false,
        activeMonth: achievement.activeMonth
      },
      create: {
        code: achievement.code,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        difficulty: achievement.difficulty,
        xpReward: achievement.xpReward,
        target: achievement.target,
        checkType: achievement.checkType,
        checkCondition: achievement.checkCondition || {},
        isMonthly: achievement.isMonthly || false,
        activeMonth: achievement.activeMonth
      }
    })
  }
}

// 월별 도전과제 로테이션 - 개선된 버전 (매월 1일 실행)
export async function rotateMonthlyAchievementsV2() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  console.log(`🔄 월별 도전과제 로테이션 시작: ${currentYear}년 ${currentMonth}월`)
  
  // 1. 모든 사용자의 도전과제 진행 상황 리셋
  const students = await prisma.studentProfile.findMany()
  
  for (const student of students) {
    // 완료된 도전과제 기록 보존 (히스토리용)
    const completedAchievements = await prisma.userAchievement.findMany({
      where: {
        studentId: student.id,
        completed: true
      },
      include: {
        achievement: true
      }
    })
    
    // 완료된 도전과제를 별도로 저장 (나중에 통계용으로 사용 가능)
    console.log(`📊 ${student.id}: ${completedAchievements.length}개 도전과제 완료 기록`)
    
    // 모든 사용자 도전과제 진행 상황 리셋
    await prisma.userAchievement.deleteMany({
      where: {
        studentId: student.id
      }
    })
  }
  
  // 2. 이전 달 도전과제 비활성화 (기록은 유지)
  await prisma.achievement.updateMany({
    where: {
      isMonthly: true
    },
    data: {
      activeMonth: 0 // 비활성화 표시
    }
  })
  
  // 3. 현재 월의 새로운 도전과제 선택
  const newMonthlyAchievements = selectMonthlyRandomAchievements(currentMonth)
  
  // 4. DB에 새로운 월별 도전과제 추가/업데이트
  for (const achievement of newMonthlyAchievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {
        isMonthly: true,
        activeMonth: currentMonth,
        updatedAt: new Date()
      },
      create: {
        code: achievement.code,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        difficulty: achievement.difficulty,
        xpReward: achievement.xpReward,
        target: achievement.target,
        checkType: achievement.checkType,
        checkCondition: achievement.checkCondition || {},
        isMonthly: true,
        activeMonth: currentMonth
      }
    })
  }
  
  // 5. 모든 활성 도전과제 가져오기 (기본 + 월별)
  const allActiveAchievements = await prisma.achievement.findMany({
    where: {
      OR: [
        { isMonthly: false }, // 기본 도전과제
        { 
          AND: [
            { isMonthly: true },
            { activeMonth: currentMonth } // 이번 달 특별 도전과제
          ]
        }
      ]
    }
  })
  
  // 6. 모든 사용자에게 새롭게 도전과제 할당 (진행 상황 0으로 시작)
  for (const student of students) {
    for (const achievement of allActiveAchievements) {
      await prisma.userAchievement.create({
        data: {
          studentId: student.id,
          achievementId: achievement.id,
          progress: 0,
          completed: false,
          claimedReward: false
        }
      })
    }
    
    console.log(`✅ ${student.id}: ${allActiveAchievements.length}개 도전과제 새로 할당`)
  }
  
  console.log(`🎯 월별 로테이션 완료!`)
  console.log(`  - 기본 도전과제: ${allActiveAchievements.filter(a => !a.isMonthly).length}개`)
  console.log(`  - ${currentMonth}월 특별 도전과제: ${allActiveAchievements.filter(a => a.isMonthly).length}개`)
  console.log(`  - 총 ${students.length}명의 학생에게 할당`)
  
  return allActiveAchievements
}

// 사용자별 도전과제 진행 상황 업데이트
export async function updateUserAchievementProgress(
  studentId: string,
  achievementCode: string,
  progress: number
) {
  const achievement = await prisma.achievement.findUnique({
    where: { code: achievementCode }
  })
  
  if (!achievement) return null
  
  const userAchievement = await prisma.userAchievement.upsert({
    where: {
      studentId_achievementId: {
        studentId,
        achievementId: achievement.id
      }
    },
    update: {
      progress: Math.min(progress, achievement.target),
      completed: progress >= achievement.target,
      completedAt: progress >= achievement.target ? new Date() : null
    },
    create: {
      studentId,
      achievementId: achievement.id,
      progress: Math.min(progress, achievement.target),
      completed: progress >= achievement.target,
      completedAt: progress >= achievement.target ? new Date() : null
    }
  })
  
  // 도전과제 완료 시 XP 보상
  if (userAchievement.completed && !userAchievement.claimedReward) {
    await claimAchievementReward(studentId, achievement.id)
  }
  
  return userAchievement
}

// 도전과제 보상 수령
export async function claimAchievementReward(studentId: string, achievementId: string) {
  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId }
  })
  
  if (!achievement) return null
  
  const userAchievement = await prisma.userAchievement.findUnique({
    where: {
      studentId_achievementId: {
        studentId,
        achievementId
      }
    }
  })
  
  if (!userAchievement || !userAchievement.completed || userAchievement.claimedReward) {
    return null
  }
  
  // 트랜잭션으로 보상 처리
  const result = await prisma.$transaction(async (tx) => {
    // 보상 수령 표시
    const updated = await tx.userAchievement.update({
      where: {
        studentId_achievementId: {
          studentId,
          achievementId
        }
      },
      data: {
        claimedReward: true
      }
    })
    
    // XP 보상 추가
    const profile = await tx.studentProfile.update({
      where: { id: studentId },
      data: {
        experience: { increment: achievement.xpReward },
        totalXP: { increment: achievement.xpReward }
      }
    })
    
    // 레벨업 체크
    const xpForCurrentLevel = calculateXPForLevel(profile.level)
    if (profile.experience >= xpForCurrentLevel) {
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          level: { increment: 1 },
          experience: profile.experience - xpForCurrentLevel,
          xpForNextLevel: calculateXPForLevel(profile.level + 1)
        }
      })
    }
    
    return { userAchievement: updated, profile }
  })
  
  return result
}

// 레벨별 필요 XP 계산
function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// 크론잡 또는 서버리스 함수로 매월 1일 실행
export async function monthlyRotationCron() {
  const today = new Date()
  if (today.getDate() === 1) {
    await rotateMonthlyAchievementsV2()
  }
}

// 사용자의 모든 도전과제 진행 상황 가져오기
export async function getUserAchievements(studentId: string) {
  const currentMonth = new Date().getMonth() + 1
  
  // 현재 활성 도전과제
  const activeAchievements = await prisma.achievement.findMany({
    where: {
      OR: [
        { isMonthly: false },
        { 
          AND: [
            { isMonthly: true },
            { activeMonth: currentMonth }
          ]
        }
      ]
    },
    include: {
      userAchievements: {
        where: { studentId }
      }
    }
  })
  
  // 사용자 도전과제 진행 상황 매핑
  const achievements = activeAchievements.map(achievement => {
    const userProgress = achievement.userAchievements[0]
    
    return {
      id: achievement.id,
      code: achievement.code,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      difficulty: achievement.difficulty,
      xpReward: achievement.xpReward,
      target: achievement.target,
      isMonthly: achievement.isMonthly,
      progress: userProgress?.progress || 0,
      completed: userProgress?.completed || false,
      completedAt: userProgress?.completedAt,
      claimedReward: userProgress?.claimedReward || false
    }
  })
  
  return achievements
}

// 월별 도전과제 히스토리 저장 (옵션)
export async function saveAchievementHistory(studentId: string, month: number, year: number) {
  const completedAchievements = await prisma.userAchievement.findMany({
    where: {
      studentId,
      completed: true
    },
    include: {
      achievement: true
    }
  })
  
  // 여기에 히스토리 저장 로직 추가 가능
  // 예: AchievementHistory 테이블에 저장
  
  return {
    studentId,
    month,
    year,
    completedCount: completedAchievements.length,
    totalXP: completedAchievements.reduce((sum, ua) => 
      sum + (ua.achievement.xpReward || 0), 0
    )
  }
}