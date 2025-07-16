import { Category } from "@prisma/client"

// 능력치 타입
export type StatType = 'strength' | 'intelligence' | 'dexterity' | 'charisma' | 'vitality'

// 카테고리별 능력치 매핑
export const CATEGORY_STAT_MAP: Record<Category, StatType> = {
  [Category.EXERCISE]: 'strength',      // 운동 → 힘
  [Category.STUDY]: 'intelligence',     // 학습 → 지능
  [Category.READING]: 'intelligence',   // 독서 → 지능
  [Category.HOBBY]: 'dexterity',       // 취미 → 민첩성
  [Category.VOLUNTEER]: 'charisma',    // 봉사 → 매력
  [Category.OTHER]: 'vitality',        // 기타 → 활력
}

// 카테고리별 XP 가중치
export const CATEGORY_XP_WEIGHT: Record<Category, number> = {
  [Category.STUDY]: 1.2,      // 학습 활동 보너스
  [Category.EXERCISE]: 1.0,
  [Category.READING]: 1.1,
  [Category.HOBBY]: 0.9,
  [Category.VOLUNTEER]: 1.1,
  [Category.OTHER]: 0.8,
}

// 레벨별 필요 경험치 계산
export function getRequiredXP(level: number): number {
  // 레벨 1: 100 XP, 레벨 100: 약 10,000 XP
  return Math.floor(100 * Math.pow(1.05, level - 1))
}

// 경험치로 레벨 계산
export function calculateLevel(totalXP: number): { level: number; currentXP: number; requiredXP: number } {
  let level = 1
  let remainingXP = totalXP
  
  while (remainingXP >= getRequiredXP(level)) {
    remainingXP -= getRequiredXP(level)
    level++
    if (level >= 100) break // 최대 레벨 100
  }
  
  return {
    level,
    currentXP: remainingXP,
    requiredXP: getRequiredXP(level),
  }
}

// 활동 시간(분)과 카테고리로 경험치 계산
export function calculateXP(minutes: number, category: Category, hasStreak: boolean = false): number {
  const baseXP = Math.floor(minutes / 10) * 10 // 10분당 10 XP
  const categoryWeight = CATEGORY_XP_WEIGHT[category]
  const streakBonus = hasStreak ? 1.2 : 1.0 // 연속 달성 시 20% 보너스
  
  return Math.floor(baseXP * categoryWeight * streakBonus)
}

// 능력치 포인트 계산 (10 XP당 1 포인트)
export function calculateStatPoints(xp: number): number {
  return Math.floor(xp / 10)
}

// 능력치 증가 계산
export function calculateStatIncrease(
  minutes: number,
  category: Category,
  hasStreak: boolean = false
): { xp: number; statPoints: Record<StatType, number> } {
  const xp = calculateXP(minutes, category, hasStreak)
  const points = calculateStatPoints(xp)
  const stat = CATEGORY_STAT_MAP[category]
  
  const statPoints: Record<StatType, number> = {
    strength: 0,
    intelligence: 0,
    dexterity: 0,
    charisma: 0,
    vitality: 0,
  }
  
  statPoints[stat] = points
  
  return { xp, statPoints }
}

// 능력치 설명
export const STAT_DESCRIPTIONS: Record<StatType, { name: string; description: string; icon: string }> = {
  strength: {
    name: "힘 (STR)",
    description: "운동을 통해 단련되는 신체적 힘",
    icon: "💪"
  },
  intelligence: {
    name: "지능 (INT)",
    description: "학습과 독서로 기르는 지적 능력",
    icon: "🧠"
  },
  dexterity: {
    name: "민첩성 (DEX)",
    description: "취미 활동으로 향상되는 손재주와 민첩함",
    icon: "🤸"
  },
  charisma: {
    name: "매력 (CHA)",
    description: "봉사 활동으로 기르는 사회성과 리더십",
    icon: "✨"
  },
  vitality: {
    name: "활력 (VIT)",
    description: "다양한 활동으로 얻는 전반적인 활력",
    icon: "🔥"
  }
}