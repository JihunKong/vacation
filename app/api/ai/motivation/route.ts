import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentData } = await req.json()
    
    const apiKey = process.env.UPSTAGE_API_KEY
    if (!apiKey) {
      console.warn("UPSTAGE_API_KEY is not set, using fallback messages")
      const defaultMessages = [
        "오늘도 성장하는 하루 되세요! 🌟",
        "당신의 노력이 빛을 발하고 있어요! 💫",
        "한 걸음씩 나아가는 당신이 멋져요! 🚀",
        "오늘의 작은 성취가 내일의 큰 성공이 됩니다! 🎯",
        "꾸준함이 만드는 기적을 믿어요! ✨"
      ]
      const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
      return NextResponse.json({ message: randomMessage })
    }

    // Upstage API 직접 호출 준비

    // 학생 데이터에서 필요한 정보 추출
    const {
      level,
      totalXP,
      currentStreak,
      recentActivity,
      strength,
      intelligence,
      dexterity,
      charisma,
      vitality,
      totalMinutes
    } = studentData

    // 가장 높은 능력치 찾기
    const stats = { 
      "힘": strength, 
      "지능": intelligence, 
      "민첩성": dexterity, 
      "매력": charisma, 
      "활력": vitality 
    }
    const topStat = Object.entries(stats).reduce((a, b) => 
      stats[a[0] as keyof typeof stats] > stats[b[0] as keyof typeof stats] ? a : b
    )[0]

    // 학습 시간을 시간 단위로 변환
    const hoursStudied = Math.floor(totalMinutes / 60)

    // 프롬프트 생성
    const prompt = `당신은 학습 동기부여 전문가입니다. 
학생의 현재 상태를 기반으로 짧고 힘찬 동기부여 메시지를 작성해주세요.

학생 정보:
- 레벨: ${level}
- 총 경험치: ${totalXP} XP
- 연속 달성: ${currentStreak}일
- 총 학습 시간: ${hoursStudied}시간
- 강점 능력치: ${topStat}
${recentActivity ? `- 최근 활동: ${recentActivity}` : ''}

조건:
1. 메시지는 1-2문장으로 작성
2. 구체적이고 개인화된 내용
3. 이모지 1-2개 포함
4. 긍정적이고 격려하는 톤
5. 학생의 현재 상태를 반영한 메시지

예시:
- "레벨 ${level}에 도달한 당신의 노력이 빛나고 있어요! 💪"
- "${currentStreak}일 연속 달성은 정말 대단해요, 계속 이어가세요! 🔥"
- "${topStat}이 뛰어난 당신, 오늘도 한 걸음 더 성장해봐요! ⭐"

메시지만 출력하고 다른 설명은 하지 마세요.`

    // Upstage AI에게 메시지 생성 요청
    const response = await fetch("https://api.upstage.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "solar-pro2",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 100,
      })
    })

    if (!response.ok) {
      throw new Error(`Upstage API error: ${response.status}`)
    }

    const completion = await response.json()
    const message = completion.choices?.[0]?.message?.content || "오늘도 성장하는 하루 되세요! 🌟"

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error generating AI message:", error)
    
    // 에러 시 기본 메시지 풀에서 랜덤 선택
    const defaultMessages = [
      "오늘도 성장하는 하루 되세요! 🌟",
      "당신의 노력이 빛을 발하고 있어요! 💫",
      "한 걸음씩 나아가는 당신이 멋져요! 🚀",
      "오늘의 작은 성취가 내일의 큰 성공이 됩니다! 🎯",
      "꾸준함이 만드는 기적을 믿어요! ✨"
    ]
    
    const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
    
    return NextResponse.json({ message: randomMessage })
  }
}

// GET 요청으로도 처리 가능하도록
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 간단한 메시지 반환 (데이터 없이)
    const defaultMessage = "오늘도 성장하는 하루 되세요! 🌟"
    return NextResponse.json({ message: defaultMessage })
  } catch (error) {
    console.error("Error in GET motivation:", error)
    return NextResponse.json({ message: "오늘도 화이팅! 💪" })
  }
}