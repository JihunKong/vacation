import { prisma } from "@/lib/db"

async function resetUserStats() {
  try {
    // 명령줄 인자로 이름 또는 이메일 받기
    const nameOrEmail = process.argv[2] || '공지훈'
    console.log(`Finding user '${nameOrEmail}'...`)
    
    // 사용자 찾기 (이름 또는 이메일로)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: nameOrEmail },
          { email: nameOrEmail }
        ]
      },
      include: {
        studentProfile: {
          include: {
            activities: true,
            levelImages: true
          }
        }
      }
    })

    if (!user) {
      console.error(`User '${nameOrEmail}' not found`)
      console.log("\nUsage: npx tsx scripts/reset-user-stats.ts [name or email]")
      console.log("Example: npx tsx scripts/reset-user-stats.ts jhkong@example.com")
      return
    }

    if (!user.studentProfile) {
      console.error(`Student profile not found for user '${nameOrEmail}'`)
      return
    }

    const studentProfileId = user.studentProfile.id
    console.log(`Found student profile: ${studentProfileId}`)

    // 1. 실제 활동 일수 계산 (중복 없는 날짜 수)
    const uniqueDates = await prisma.activity.findMany({
      where: {
        studentId: studentProfileId
      },
      select: {
        date: true
      },
      distinct: ['date']
    })

    const actualTotalDays = uniqueDates.length
    console.log(`Actual total days with activities: ${actualTotalDays}`)

    // 2. 프로필 초기화
    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: {
        level: 1,
        experience: 0,
        totalXP: 0,
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        charisma: 10,
        vitality: 10,
        currentStreak: 0,
        longestStreak: 0,
        totalDays: actualTotalDays, // 실제 활동 일수로 설정
        totalMinutes: 0,
        xpForNextLevel: 100,
      }
    })
    console.log("Profile stats reset successfully")

    // 3. 모든 활동 삭제
    const deletedActivities = await prisma.activity.deleteMany({
      where: { studentId: studentProfileId }
    })
    console.log(`Deleted ${deletedActivities.count} activities`)

    // 4. 모든 레벨 이미지 삭제
    const deletedImages = await prisma.levelImage.deleteMany({
      where: { studentId: studentProfileId }
    })
    console.log(`Deleted ${deletedImages.count} level images`)

    // 5. 모든 배지 삭제
    const deletedBadges = await prisma.badge.deleteMany({
      where: { studentId: studentProfileId }
    })
    console.log(`Deleted ${deletedBadges.count} badges`)

    // 6. 모든 계획 삭제
    const deletedPlans = await prisma.plan.deleteMany({
      where: { studentId: studentProfileId }
    })
    console.log(`Deleted ${deletedPlans.count} plans`)

    // 7. 모든 도전과제 진행 삭제
    const deletedAchievements = await prisma.userAchievement.deleteMany({
      where: { studentId: studentProfileId }
    })
    console.log(`Deleted ${deletedAchievements.count} achievement progress`)

    // 8. 모든 뽀모도로 세션 삭제
    const deletedPomodoros = await prisma.pomodoroSession.deleteMany({
      where: { studentId: studentProfileId }
    })
    console.log(`Deleted ${deletedPomodoros.count} pomodoro sessions`)

    console.log(`\n✅ User '${user.name || user.email}' stats have been reset successfully!`)
    console.log("- Level: 1")
    console.log("- XP: 0")
    console.log("- All stats: 10")
    console.log(`- Total days: ${actualTotalDays}`)
    console.log("- All activities, images, badges deleted")

  } catch (error) {
    console.error("Error resetting user stats:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
resetUserStats()