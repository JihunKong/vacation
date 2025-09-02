import { prisma } from "@/lib/db"

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log("All users in database:")
    console.log("====================")
    users.forEach(user => {
      console.log(`- Name: ${user.name || 'N/A'}, Email: ${user.email}, Role: ${user.role}`)
    })
    console.log(`\nTotal users: ${users.length}`)
    
  } catch (error) {
    console.error("Error listing users:", error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()