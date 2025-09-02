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

// 월별 도전과제 로테이션 (매월 1일 실행)
export async function rotateMonthlyAchievements() {
  const currentMonth = new Date().getMonth() + 1
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
  
  // 1. 이전 달 월별 도전과제 완료 처리
  const lastMonthAchievements = await prisma.achievement.findMany({
    where: {
      isMonthly: true,
      activeMonth: lastMonth
    }
  })
  
  // 미완료된 이전 달 도전과제 실패 처리
  for (const achievement of lastMonthAchievements) {
    await prisma.userAchievement.updateMany({
      where: {
        achievementId: achievement.id,
        completed: false
      },
      data: {
        // 실패한 도전과제는 삭제하지 않고 기록 유지
        updatedAt: new Date()
      }
    })
  }
  
  // 2. 현재 월의 새로운 도전과제 선택
  const newMonthlyAchievements = selectMonthlyRandomAchievements(currentMonth)
  
  // 3. DB에 새로운 월별 도전과제 추가/업데이트
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
  
  // 4. 모든 사용자에게 새로운 도전과제 할당
  const students = await prisma.studentProfile.findMany()
  const newAchievements = await prisma.achievement.findMany({
    where: {
      isMonthly: true,
      activeMonth: currentMonth
    }
  })
  
  for (const student of students) {
    for (const achievement of newAchievements) {
      // 이미 존재하지 않는 경우에만 생성
      await prisma.userAchievement.upsert({
        where: {
          studentId_achievementId: {
            studentId: student.id,
            achievementId: achievement.id
          }
        },
        update: {},
        create: {
          studentId: student.id,
          achievementId: achievement.id,
          progress: 0,
          completed: false
        }
      })
    }
  }
  
  console.log(`✅ 월별 도전과제 로테이션 완료: ${currentMonth}월`)
  return newAchievements
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
    await rotateMonthlyAchievements()
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