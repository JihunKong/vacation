import { BadgeType, Category } from "@prisma/client"

export interface BadgeCriteria {
  type: BadgeType
  tier: number
  name: string
  description: string
  icon: string
  check: (data: BadgeCheckData) => boolean
}

export interface BadgeCheckData {
  totalMinutes: Record<Category, number>
  level: number
  currentStreak: number
  totalDays: number
}

// 배지 획득 조건 정의
export const BADGE_CRITERIA: BadgeCriteria[] = [
  // 학습의 달인
  {
    type: BadgeType.STUDY_MASTER,
    tier: 1,
    name: "학습 초심자",
    description: "학습 활동 10시간 달성",
    icon: "📚",
    check: (data) => data.totalMinutes[Category.STUDY] >= 600
  },
  {
    type: BadgeType.STUDY_MASTER,
    tier: 2,
    name: "학습 숙련자",
    description: "학습 활동 30시간 달성",
    icon: "📖",
    check: (data) => data.totalMinutes[Category.STUDY] >= 1800
  },
  {
    type: BadgeType.STUDY_MASTER,
    tier: 3,
    name: "학습의 달인",
    description: "학습 활동 50시간 달성",
    icon: "🎓",
    check: (data) => data.totalMinutes[Category.STUDY] >= 3000
  },
  
  // 운동의 달인
  {
    type: BadgeType.FITNESS_GURU,
    tier: 1,
    name: "운동 초심자",
    description: "운동 활동 10시간 달성",
    icon: "🏃",
    check: (data) => data.totalMinutes[Category.EXERCISE] >= 600
  },
  {
    type: BadgeType.FITNESS_GURU,
    tier: 2,
    name: "운동 숙련자",
    description: "운동 활동 30시간 달성",
    icon: "🏋️",
    check: (data) => data.totalMinutes[Category.EXERCISE] >= 1800
  },
  {
    type: BadgeType.FITNESS_GURU,
    tier: 3,
    name: "운동의 달인",
    description: "운동 활동 50시간 달성",
    icon: "🏆",
    check: (data) => data.totalMinutes[Category.EXERCISE] >= 3000
  },
  
  // 독서왕
  {
    type: BadgeType.BOOKWORM,
    tier: 1,
    name: "독서 초심자",
    description: "독서 활동 10시간 달성",
    icon: "📕",
    check: (data) => data.totalMinutes[Category.READING] >= 600
  },
  {
    type: BadgeType.BOOKWORM,
    tier: 2,
    name: "독서 애호가",
    description: "독서 활동 30시간 달성",
    icon: "📗",
    check: (data) => data.totalMinutes[Category.READING] >= 1800
  },
  {
    type: BadgeType.BOOKWORM,
    tier: 3,
    name: "독서왕",
    description: "독서 활동 50시간 달성",
    icon: "📘",
    check: (data) => data.totalMinutes[Category.READING] >= 3000
  },
  
  // 취미의 달인
  {
    type: BadgeType.HOBBY_EXPERT,
    tier: 1,
    name: "취미 초심자",
    description: "취미 활동 10시간 달성",
    icon: "🎨",
    check: (data) => data.totalMinutes[Category.HOBBY] >= 600
  },
  {
    type: BadgeType.HOBBY_EXPERT,
    tier: 2,
    name: "취미 애호가",
    description: "취미 활동 30시간 달성",
    icon: "🎸",
    check: (data) => data.totalMinutes[Category.HOBBY] >= 1800
  },
  {
    type: BadgeType.HOBBY_EXPERT,
    tier: 3,
    name: "취미의 달인",
    description: "취미 활동 50시간 달성",
    icon: "🎭",
    check: (data) => data.totalMinutes[Category.HOBBY] >= 3000
  },
  
  // 봉사왕
  {
    type: BadgeType.VOLUNTEER_HERO,
    tier: 1,
    name: "봉사 초심자",
    description: "봉사 활동 5시간 달성",
    icon: "🤝",
    check: (data) => data.totalMinutes[Category.VOLUNTEER] >= 300
  },
  {
    type: BadgeType.VOLUNTEER_HERO,
    tier: 2,
    name: "봉사 천사",
    description: "봉사 활동 15시간 달성",
    icon: "👼",
    check: (data) => data.totalMinutes[Category.VOLUNTEER] >= 900
  },
  {
    type: BadgeType.VOLUNTEER_HERO,
    tier: 3,
    name: "봉사왕",
    description: "봉사 활동 30시간 달성",
    icon: "🦸",
    check: (data) => data.totalMinutes[Category.VOLUNTEER] >= 1800
  },
  
  // 연속 달성
  {
    type: BadgeType.STREAK_KEEPER,
    tier: 1,
    name: "3일 연속",
    description: "3일 연속 계획 달성",
    icon: "🔥",
    check: (data) => data.currentStreak >= 3
  },
  {
    type: BadgeType.STREAK_KEEPER,
    tier: 2,
    name: "7일 연속",
    description: "7일 연속 계획 달성",
    icon: "🔥🔥",
    check: (data) => data.currentStreak >= 7
  },
  {
    type: BadgeType.STREAK_KEEPER,
    tier: 3,
    name: "14일 연속",
    description: "14일 연속 계획 달성",
    icon: "🔥🔥🔥",
    check: (data) => data.currentStreak >= 14
  },
  
  // 레벨 달성
  {
    type: BadgeType.LEVEL_MILESTONE,
    tier: 1,
    name: "레벨 10",
    description: "레벨 10 달성",
    icon: "⭐",
    check: (data) => data.level >= 10
  },
  {
    type: BadgeType.LEVEL_MILESTONE,
    tier: 2,
    name: "레벨 25",
    description: "레벨 25 달성",
    icon: "⭐⭐",
    check: (data) => data.level >= 25
  },
  {
    type: BadgeType.LEVEL_MILESTONE,
    tier: 3,
    name: "레벨 50",
    description: "레벨 50 달성",
    icon: "⭐⭐⭐",
    check: (data) => data.level >= 50
  },
]

// 배지 티어별 색상
export const BADGE_TIER_COLORS = {
  1: "bg-amber-600", // 브론즈
  2: "bg-gray-400",  // 실버
  3: "bg-yellow-500", // 골드
}