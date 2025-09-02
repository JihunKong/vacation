import { prisma } from "@/lib/db"

async function checkUserStats() {
  try {
    // 이름 또는 이메일로 사용자 찾기
    const nameOrEmail = process.argv[2]
    
    if (!nameOrEmail) {
      console.log("Usage: npx tsx scripts/check-user-stats.ts [name or email]")
      return
    }
    
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
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    })

    if (!user) {
      console.error(`User '${nameOrEmail}' not found`)
      return
    }

    if (!user.studentProfile) {
      console.error(`Student profile not found for user '${nameOrEmail}'`)
      return
    }

    const profile = user.studentProfile
    
    console.log("\n===== User Stats =====")
    console.log(`Name: ${user.name || 'N/A'}`)
    console.log(`Email: ${user.email}`)
    console.log(`Level: ${profile.level}`)
    console.log(`Total XP: ${profile.totalXP}`)
    console.log(`Total Minutes: ${profile.totalMinutes} (${Math.floor(profile.totalMinutes / 60)} hours)`)
    console.log(`Total Days: ${profile.totalDays}`)
    
    console.log("\n===== Ability Stats =====")
    console.log(`STR (Strength): ${profile.strength}`)
    console.log(`INT (Intelligence): ${profile.intelligence}`)
    console.log(`DEX (Dexterity): ${profile.dexterity}`)
    console.log(`CHA (Charisma): ${profile.charisma}`)
    console.log(`VIT (Vitality): ${profile.vitality}`)
    
    const totalStats = profile.strength + profile.intelligence + profile.dexterity + profile.charisma + profile.vitality
    console.log(`Total Stats: ${totalStats}`)
    console.log(`Average per stat: ${(totalStats / 5).toFixed(1)}`)
    
    // 활동 분석
    const allActivities = await prisma.activity.findMany({
      where: { studentId: profile.id }
    })
    
    const totalXPFromActivities = allActivities.reduce((sum, act) => sum + act.xpEarned, 0)
    const expectedStatPoints = Math.floor(totalXPFromActivities / 10)
    
    console.log("\n===== Analysis =====")
    console.log(`Total XP from activities: ${totalXPFromActivities}`)
    console.log(`Expected stat points (XP/10): ${expectedStatPoints}`)
    console.log(`Actual total stats: ${totalStats}`)
    console.log(`Base stats (5 categories × 10): 50`)
    console.log(`Stats gained: ${totalStats - 50}`)
    
    if (totalStats - 50 > expectedStatPoints) {
      console.log(`⚠️  Stats are ${totalStats - 50 - expectedStatPoints} points higher than expected`)
      console.log("This might be due to:")
      console.log("- Level-up bonuses")
      console.log("- Manual adjustments")
      console.log("- Double counting from bugs")
    }
    
    console.log("\n===== Recent Activities =====")
    profile.activities.slice(0, 5).forEach(act => {
      console.log(`- ${act.title}: ${act.minutes}min, ${act.xpEarned}XP (${act.category})`)
    })
    
  } catch (error) {
    console.error("Error checking user stats:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserStats()