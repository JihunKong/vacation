import { PrismaClient } from '@prisma/client'
import { calculateLevel, getRequiredXP } from '../lib/game/stats'

// 환경변수로 전달된 URL 사용
const databaseUrl = process.env.DATABASE_URL || ''
console.log('Using DATABASE_URL:', databaseUrl.substring(0, 50) + '...')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

async function main() {
  console.log('\n=== 학생 프로필 데이터 확인 ===\n')

  const students = await prisma.studentProfile.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  })

  console.log(`총 ${students.length}명의 학생 발견\n`)

  for (const student of students) {
    // 실제 계산된 레벨 정보
    const calculated = calculateLevel(student.totalXP)

    console.log(`학생: ${student.user.name}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`DB 레벨: ${student.level}`)
    console.log(`계산된 레벨: ${calculated.level}`)
    console.log(`레벨 불일치: ${student.level !== calculated.level ? '⚠️ 예' : '✅ 아니오'}`)
    console.log()
    console.log(`총 XP: ${student.totalXP}`)
    console.log(`DB experience: ${student.experience}`)
    console.log(`계산된 currentXP: ${calculated.currentXP}`)
    console.log(`DB xpForNextLevel: ${student.xpForNextLevel}`)
    console.log(`계산된 requiredXP: ${calculated.requiredXP}`)
    console.log()
    console.log(`능력치:`)
    console.log(`  STR (힘):    ${student.strength}`)
    console.log(`  INT (지능):  ${student.intelligence}`)
    console.log(`  DEX (민첩):  ${student.dexterity}`)
    console.log(`  CHA (매력):  ${student.charisma}`)
    console.log(`  VIT (활력):  ${student.vitality}`)
    console.log()

    // 레벨 60 -> 61에 필요한 XP 계산
    console.log(`레벨 60 필요 XP: ${getRequiredXP(60)}`)
    console.log(`레벨 61 필요 XP: ${getRequiredXP(61)}`)

    // 레벨 60까지의 총 XP 계산
    let totalXPFor60 = 0
    for (let i = 1; i < 60; i++) {
      totalXPFor60 += getRequiredXP(i)
    }
    console.log(`레벨 60 도달에 필요한 총 XP: ${totalXPFor60}`)
    console.log(`레벨 61 도달에 필요한 총 XP: ${totalXPFor60 + getRequiredXP(60)}`)
    console.log('\n')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
