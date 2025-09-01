import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStuckPomodoroSessions() {
  console.log('Starting Pomodoro session cleanup...')
  
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
    
    console.log(`Found ${incompleteSessions.length} incomplete sessions`)
    
    if (incompleteSessions.length === 0) {
      console.log('No stuck sessions found!')
      return
    }
    
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
      
      console.log(`Fixed session ${session.id} for user ${session.student?.user?.email || 'unknown'} (was running for ${actualMinutes} minutes)`)
    }
    
    console.log(`Successfully fixed ${incompleteSessions.length} stuck sessions`)
    
  } catch (error) {
    console.error('Error fixing stuck sessions:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
fixStuckPomodoroSessions()
  .then(() => {
    console.log('Cleanup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Cleanup failed:', error)
    process.exit(1)
  })