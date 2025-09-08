import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== 스텟 및 이미지 수정 스크립트 시작 ===\n')

  // 1. 비정상적인 스텟을 가진 학생들 조회
  console.log('1. 비정상적인 스텟을 가진 학생들 조회...')
  const abnormalStudents = await prisma.studentProfile.findMany({
    where: {
      OR: [
        { intelligence: { gt: 100 } },
        { strength: { gt: 100 } },
        { dexterity: { gt: 100 } },
        { charisma: { gt: 100 } },
        { vitality: { gt: 100 } }
      ]
    },
    include: {
      user: true
    }
  })

  console.log(`발견된 비정상 스텟 학생: ${abnormalStudents.length}명\n`)

  // 2. 각 학생의 스텟 수정
  for (const student of abnormalStudents) {
    console.log(`\n학생: ${student.user.name} (${student.user.email})`)
    console.log(`현재 레벨: ${student.level}`)
    console.log(`현재 스텟 - STR: ${student.strength}, INT: ${student.intelligence}, DEX: ${student.dexterity}, CHA: ${student.charisma}, VIT: ${student.vitality}`)
    
    // 레벨 기반 스텟 상한선 (레벨당 최대 1.5 포인트, 최대 100)
    const maxStat = Math.min(Math.floor(student.level * 1.5), 100)
    
    const updates: any = {}
    if (student.strength > maxStat) updates.strength = maxStat
    if (student.intelligence > maxStat) updates.intelligence = maxStat
    if (student.dexterity > maxStat) updates.dexterity = maxStat
    if (student.charisma > maxStat) updates.charisma = maxStat
    if (student.vitality > maxStat) updates.vitality = maxStat
    
    if (Object.keys(updates).length > 0) {
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: updates
      })
      console.log(`✅ 스텟을 최대 ${maxStat}로 조정했습니다.`)
    }
  }

  // 3. 10레벨 이상인데 이미지가 없는 학생들 조회
  console.log('\n\n=== 10레벨 이상 이미지 누락 확인 ===')
  const levelStudents = await prisma.studentProfile.findMany({
    where: {
      level: { gte: 10 }
    },
    include: {
      user: true,
      levelImages: true
    }
  })

  console.log(`10레벨 이상 학생: ${levelStudents.length}명`)

  const missingImages: any[] = []
  
  for (const student of levelStudents) {
    const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    
    for (const milestone of milestones) {
      if (student.level >= milestone) {
        const hasImage = student.levelImages.some(img => img.level === milestone)
        
        if (!hasImage) {
          missingImages.push({
            studentName: student.user.name,
            studentEmail: student.user.email,
            studentId: student.id,
            level: student.level,
            missingMilestone: milestone
          })
        }
      }
    }
  }

  if (missingImages.length > 0) {
    console.log('\n누락된 이미지:')
    missingImages.forEach(item => {
      console.log(`- ${item.studentName} (${item.studentEmail}): 레벨 ${item.level}, ${item.missingMilestone}레벨 이미지 누락`)
    })
    
    // 첫 번째 누락 케이스에 대해 수동으로 이미지 생성 시도
    if (missingImages.length > 0) {
      const first = missingImages[0]
      console.log(`\n첫 번째 학생(${first.studentName})의 ${first.missingMilestone}레벨 이미지를 생성 시도합니다...`)
      
      // 브라우저에서 실행할 코드 출력
      console.log('\n=== 브라우저 콘솔에서 실행할 코드 ===')
      console.log(`
// ${first.studentName}님으로 로그인한 후 브라우저 콘솔에서 실행하세요:
fetch('/api/level-image/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    level: ${first.missingMilestone}
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ 이미지 생성 성공!', data)
  } else {
    console.error('❌ 이미지 생성 실패:', data)
  }
})
.catch(console.error)
      `)
    }
  } else {
    console.log('\n✅ 모든 학생의 마일스톤 이미지가 정상적으로 존재합니다.')
  }

  console.log('\n=== 스크립트 완료 ===')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())