import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get('period') || 'current'
    const schoolOnly = searchParams.get('schoolOnly') === 'true'
    
    // 사용자의 학교 정보 가져오기
    let userSchoolId: string | null = null
    if (schoolOnly) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { schoolId: true }
      })
      userSchoolId = currentUser?.schoolId || null
    }
    
    let monthStart: Date
    let monthEnd: Date
    
    if (period === 'current') {
      const now = new Date()
      monthStart = startOfMonth(now)
      monthEnd = endOfMonth(now)
    } else {
      // Format: yyyy-MM
      const [year, month] = period.split('-').map(Number)
      monthStart = new Date(year, month - 1, 1)
      monthEnd = endOfMonth(monthStart)
    }

    // 해당 월 활동 집계 (학교별 필터링 포함)
    const whereClause = schoolOnly && userSchoolId 
      ? { user: { schoolId: userSchoolId } }
      : {}
    
    const studentsWithMonthlyStats = await prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, schoolId: true, school: true },
        },
        activities: {
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }
      }
    })

    // 월간 통계 계산
    const studentsWithStats = studentsWithMonthlyStats.map(student => {
      const monthlyXP = student.activities.reduce((sum, a) => sum + a.xpEarned, 0)
      const monthlyMinutes = student.activities.reduce((sum, a) => sum + a.minutes, 0)
      
      return {
        ...student,
        monthlyXP,
        monthlyMinutes,
        activities: undefined // Remove activities array from response
      }
    }).filter(s => s.monthlyXP > 0) // Only include students with activity this month

    // XP 기준 상위 20명
    const topStudents = studentsWithStats
      .sort((a, b) => b.monthlyXP - a.monthlyXP)
      .slice(0, 20)

    // 활동 시간 기준 상위 10명
    const mostActiveStudents = studentsWithStats
      .sort((a, b) => b.monthlyMinutes - a.monthlyMinutes)
      .slice(0, 10)

    // 연속 출석 기준 (학교별 필터링 포함)
    // 과거 월의 경우 해당 시점의 데이터가 없으므로 현재 데이터 사용
    const streakWhereClause = schoolOnly && userSchoolId 
      ? { currentStreak: { gt: 0 }, user: { schoolId: userSchoolId } }
      : { currentStreak: { gt: 0 } }
    
    const longestStreaks = period === 'current' 
      ? await prisma.studentProfile.findMany({
          orderBy: { currentStreak: "desc" },
          where: streakWhereClause,
          take: 10,
          include: {
            user: {
              select: { name: true, schoolId: true, school: true },
            },
          },
        })
      : [] // 과거 데이터는 연속 기록 표시 안 함

    // 사용자의 학교 정보 가져오기 (응답용)
    const userWithSchool = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        schoolId: true,
        school: {
          select: { 
            id: true, 
            name: true,
            region: true,
            district: true
          }
        }
      }
    })
    
    return NextResponse.json({
      topStudents,
      mostActiveStudents,
      longestStreaks,
      currentUserId: session.user.id,
      userSchool: userWithSchool?.school,
      schoolOnly
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}