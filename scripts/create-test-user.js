const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Get a school
    const school = await prisma.school.findFirst({
      where: {
        name: "서울고등학교"
      }
    })

    if (!school) {
      console.error("No school found. Please run seed-schools.js first.")
      return
    }

    // Create a test user without school
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    const userWithoutSchool = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: '테스트 사용자',
        role: 'STUDENT',
        // No school assigned initially
      },
    })

    console.log('Created test user without school:', userWithoutSchool.email)

    // Create a test user with school
    const userWithSchool = await prisma.user.upsert({
      where: { email: 'student@example.com' },
      update: {},
      create: {
        email: 'student@example.com',
        password: hashedPassword,
        name: '학교 학생',
        role: 'STUDENT',
        schoolId: school.id,
      },
    })

    console.log('Created test user with school:', userWithSchool.email, '- School:', school.name)

    // Create StudentProfile for both users
    await prisma.studentProfile.upsert({
      where: { userId: userWithoutSchool.id },
      update: {},
      create: {
        userId: userWithoutSchool.id,
      },
    })

    await prisma.studentProfile.upsert({
      where: { userId: userWithSchool.id },
      update: {},
      create: {
        userId: userWithSchool.id,
      },
    })

    console.log('Test users created successfully!')
    console.log('Login credentials:')
    console.log('  User without school: test@example.com / test123')
    console.log('  User with school: student@example.com / test123')
  } catch (error) {
    console.error('Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()