const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixLevelImages() {
  try {
    // 10레벨 이상인 학생들 조회
    const students = await prisma.studentProfile.findMany({
      where: {
        level: {
          gte: 10
        }
      },
      include: {
        user: true,
        levelImages: true
      }
    })

    console.log(`Found ${students.length} students with level 10 or above`)

    for (const student of students) {
      // 10레벨 단위 체크
      const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      
      for (const milestone of milestones) {
        if (student.level >= milestone) {
          // 해당 마일스톤 이미지가 있는지 확인
          const hasImage = student.levelImages.some(img => img.level === milestone)
          
          if (!hasImage) {
            console.log(`Student ${student.user.name} (level ${student.level}) is missing level ${milestone} image`)
            
            // 이미지 생성 API 호출
            try {
              const response = await fetch('http://localhost:3000/api/level-image/generate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  level: milestone,
                  studentId: student.id
                })
              })
              
              if (response.ok) {
                console.log(`✅ Generated level ${milestone} image for ${student.user.name}`)
              } else {
                console.log(`❌ Failed to generate image: ${await response.text()}`)
              }
            } catch (error) {
              console.log(`❌ Error generating image: ${error.message}`)
            }
          }
        }
      }
    }

    // 스탯 이상 체크
    console.log('\n=== Checking abnormal stats ===')
    const abnormalStats = await prisma.studentProfile.findMany({
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

    console.log(`Found ${abnormalStats.length} students with abnormal stats`)
    
    for (const student of abnormalStats) {
      console.log(`\nStudent: ${student.user.name} (${student.user.email})`)
      console.log(`Level: ${student.level}`)
      console.log(`Stats - STR: ${student.strength}, INT: ${student.intelligence}, DEX: ${student.dexterity}, CHA: ${student.charisma}, VIT: ${student.vitality}`)
      
      // 각 스탯을 레벨 기반 상한선으로 제한 (레벨당 최대 2포인트)
      const maxStat = Math.min(student.level * 2, 100)
      
      const updates = {}
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
        console.log(`✅ Fixed stats to max ${maxStat} per stat`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixLevelImages()