import { PrismaClient } from '@prisma/client'

// This script can be run locally with the production DATABASE_URL
// Usage: DATABASE_URL="production_url" npx tsx scripts/fix-production-pomodoro.ts

async function fixProductionPomodoroSessions() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not provided')
    console.log('Usage: DATABASE_URL="your_production_database_url" npx tsx scripts/fix-production-pomodoro.ts')
    process.exit(1)
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

  console.log('🚀 Starting production Pomodoro session cleanup...')
  console.log('📍 Database:', databaseUrl.replace(/:[^:@]+@/, ':****@')) // Hide password in logs
  
  try {
    // Find all incomplete Pomodoro sessions
    const incompleteSessions = await prisma.pomodoroSession.findMany({
      where: {
        isCompleted: false
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${incompleteSessions.length} incomplete sessions`)
    
    if (incompleteSessions.length === 0) {
      console.log('✅ No stuck sessions found! Database is clean.')
      return
    }
    
    // Group by user for better visibility
    const sessionsByUser = incompleteSessions.reduce((acc, session) => {
      const email = session.student?.user?.email || 'unknown'
      if (!acc[email]) acc[email] = []
      acc[email].push(session)
      return acc
    }, {} as Record<string, typeof incompleteSessions>)
    
    console.log('\n📋 Sessions by user:')
    for (const [email, sessions] of Object.entries(sessionsByUser)) {
      console.log(`  - ${email}: ${sessions.length} stuck session(s)`)
    }
    
    console.log('\n🔧 Fixing sessions...')
    
    // Mark each incomplete session as completed
    for (const session of incompleteSessions) {
      const endTime = new Date()
      const actualMinutes = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000)
      
      await prisma.pomodoroSession.update({
        where: { id: session.id },
        data: {
          isCompleted: true,
          endTime: endTime,
          actualMinutes: Math.min(actualMinutes, session.targetMinutes), // Cap at target minutes
          bonusXP: 0 // No bonus for stuck sessions
        }
      })
      
      const userEmail = session.student?.user?.email || 'unknown'
      console.log(`  ✓ Fixed session ${session.id} for ${userEmail} (was running for ${actualMinutes} minutes)`)
    }
    
    console.log(`\n✅ Successfully fixed ${incompleteSessions.length} stuck sessions!`)
    console.log('🎉 Users can now start new Pomodoro sessions.')
    
  } catch (error) {
    console.error('\n❌ Error fixing stuck sessions:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
fixProductionPomodoroSessions()
  .then(() => {
    console.log('\n🏁 Cleanup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  })