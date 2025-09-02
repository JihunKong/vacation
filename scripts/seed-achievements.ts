#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import { allAchievements } from '../lib/achievements-data'

const prisma = new PrismaClient()

async function seedAchievements() {
  console.log('🌱 도전과제 데이터 시드 시작...')
  
  try {
    // 현재 월 가져오기
    const currentMonth = new Date().getMonth() + 1
    console.log(`📅 현재 월: ${currentMonth}월`)
    
    // 모든 도전과제 추가
    let addedCount = 0
    let updatedCount = 0
    
    for (const achievement of allAchievements) {
      // 월별 도전과제는 해당 월에만 활성화
      if (achievement.isMonthly && achievement.activeMonth !== currentMonth) {
        continue
      }
      
      const existing = await prisma.achievement.findUnique({
        where: { code: achievement.code }
      })
      
      if (existing) {
        // 기존 도전과제 업데이트
        await prisma.achievement.update({
          where: { code: achievement.code },
          data: {
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
        updatedCount++
        console.log(`✅ 업데이트: ${achievement.title}`)
      } else {
        // 새 도전과제 생성
        await prisma.achievement.create({
          data: {
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
        addedCount++
        console.log(`➕ 추가: ${achievement.title}`)
      }
    }
    
    console.log(`\n📊 결과:`)
    console.log(`  - 추가된 도전과제: ${addedCount}개`)
    console.log(`  - 업데이트된 도전과제: ${updatedCount}개`)
    
    // 모든 학생에게 도전과제 할당
    console.log('\n👥 학생들에게 도전과제 할당 중...')
    
    const students = await prisma.studentProfile.findMany()
    const achievements = await prisma.achievement.findMany({
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
      }
    })
    
    let assignedCount = 0
    
    for (const student of students) {
      for (const achievement of achievements) {
        const existing = await prisma.userAchievement.findUnique({
          where: {
            studentId_achievementId: {
              studentId: student.id,
              achievementId: achievement.id
            }
          }
        })
        
        if (!existing) {
          await prisma.userAchievement.create({
            data: {
              studentId: student.id,
              achievementId: achievement.id,
              progress: 0,
              completed: false
            }
          })
          assignedCount++
        }
      }
    }
    
    console.log(`✅ ${assignedCount}개의 도전과제가 학생들에게 할당되었습니다.`)
    
    // 통계 출력
    const totalAchievements = await prisma.achievement.count()
    const monthlyActive = await prisma.achievement.count({
      where: {
        isMonthly: true,
        activeMonth: currentMonth
      }
    })
    const baseActive = await prisma.achievement.count({
      where: { isMonthly: false }
    })
    
    console.log('\n📈 전체 통계:')
    console.log(`  - 총 도전과제: ${totalAchievements}개`)
    console.log(`  - 기본 도전과제: ${baseActive}개`)
    console.log(`  - ${currentMonth}월 특별 도전과제: ${monthlyActive}개`)
    
    console.log('\n✨ 도전과제 시드 완료!')
    
  } catch (error) {
    console.error('❌ 시드 중 오류 발생:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
seedAchievements().catch(console.error)