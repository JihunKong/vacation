import { Category } from "@prisma/client"

export type StatType = 'strength' | 'intelligence' | 'dexterity' | 'charisma' | 'vitality'

export const CATEGORY_STAT_MAP: Record<Category, StatType> = {
  [Category.EXERCISE]: 'strength',
  [Category.STUDY]: 'intelligence',
  [Category.READING]: 'intelligence',
  [Category.HOBBY]: 'dexterity',
  [Category.VOLUNTEER]: 'charisma',
  [Category.OTHER]: 'vitality',
}

export const CATEGORY_XP_WEIGHT: Record<Category, number> = {
  [Category.STUDY]: 1.2,
  [Category.EXERCISE]: 1.0,
  [Category.READING]: 1.1,
  [Category.HOBBY]: 0.9,
  [Category.VOLUNTEER]: 1.1,
  [Category.OTHER]: 0.8,
}

export function getRequiredXP(level: number): number {
  return Math.floor(100 * Math.pow(1.05, level - 1))
}

export function calculateLevel(totalXP: number): { level: number; currentXP: number; requiredXP: number } {
  let level = 1
  let remainingXP = totalXP
  
  while (remainingXP >= getRequiredXP(level)) {
    remainingXP -= getRequiredXP(level)
    level++
    if (level >= 100) break
  }
  
  return {
    level,
    currentXP: remainingXP,
    requiredXP: getRequiredXP(level),
  }
}

export function calculateXP(minutes: number, category: Category, hasStreak: boolean = false): number {
  const baseXP = Math.floor(minutes / 10) * 10
  const categoryWeight = CATEGORY_XP_WEIGHT[category]
  const streakBonus = hasStreak ? 1.2 : 1.0
  
  return Math.floor(baseXP * categoryWeight * streakBonus)
}

export function calculateStatPoints(xp: number): number {
  return Math.floor(xp / 10)
}

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