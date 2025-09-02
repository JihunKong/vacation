import { AchievementCategory, AchievementDifficulty } from '@prisma/client'

export interface AchievementDefinition {
  code: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  difficulty: AchievementDifficulty
  xpReward: number
  target: number
  checkType: string
  checkCondition?: any
  isMonthly?: boolean
  activeMonth?: number
}

// 기본 도전과제 (항상 활성)
export const baseAchievements: AchievementDefinition[] = [
  // 학습 관련 도전과제
  {
    code: 'first_activity',
    title: '첫 걸음',
    description: '첫 활동을 기록하세요',
    icon: '👶',
    category: 'STUDY',
    difficulty: 'EASY',
    xpReward: 10,
    target: 1,
    checkType: 'totalActivities'
  },
  {
    code: 'polyglot',
    title: '폴리글롯',
    description: '하루에 3개 이상의 과목 학습',
    icon: '🌍',
    category: 'STUDY',
    difficulty: 'MEDIUM',
    xpReward: 50,
    target: 3,
    checkType: 'dailySubjects'
  },
  {
    code: 'night_scholar',
    title: '심야 학자',
    description: '자정~새벽 2시 사이 학습 3회',
    icon: '🌙',
    category: 'STUDY',
    difficulty: 'HARD',
    xpReward: 80,
    target: 3,
    checkType: 'lateNightStudy',
    checkCondition: { timeStart: 0, timeEnd: 2 }
  },
  {
    code: 'weekend_warrior',
    title: '주말 전사',
    description: '주말에만 50시간 학습 달성',
    icon: '⚔️',
    category: 'STUDY',
    difficulty: 'HARD',
    xpReward: 100,
    target: 50,
    checkType: 'weekendHours'
  },
  {
    code: 'sprinter',
    title: '스프린터',
    description: '하루 8시간 이상 학습',
    icon: '🏃',
    category: 'STUDY',
    difficulty: 'HARD',
    xpReward: 120,
    target: 480,
    checkType: 'dailyMinutes'
  },
  {
    code: 'steady_turtle',
    title: '꾸준한 거북이',
    description: '30일 연속 최소 30분 학습',
    icon: '🐢',
    category: 'STREAK',
    difficulty: 'LEGENDARY',
    xpReward: 200,
    target: 30,
    checkType: 'consecutiveDays',
    checkCondition: { minMinutes: 30 }
  },
  
  // 게임화 도전과제
  {
    code: 'combo_master',
    title: '콤보 마스터',
    description: '5일 연속 목표 100% 달성',
    icon: '💥',
    category: 'STREAK',
    difficulty: 'HARD',
    xpReward: 100,
    target: 5,
    checkType: 'perfectDayStreak'
  },
  {
    code: 'perfect_week',
    title: '퍼펙트 위크',
    description: '일주일 모든 계획 완료',
    icon: '✨',
    category: 'STREAK',
    difficulty: 'HARD',
    xpReward: 150,
    target: 7,
    checkType: 'weeklyPerfect'
  },
  {
    code: 'xp_hunter',
    title: 'XP 헌터',
    description: '하루 500 XP 획득',
    icon: '💎',
    category: 'LEVEL',
    difficulty: 'MEDIUM',
    xpReward: 50,
    target: 500,
    checkType: 'dailyXP'
  },
  {
    code: 'level_up_mania',
    title: '레벨업 매니아',
    description: '일주일 내 3레벨 상승',
    icon: '📈',
    category: 'LEVEL',
    difficulty: 'HARD',
    xpReward: 120,
    target: 3,
    checkType: 'weeklyLevelUp'
  },
  {
    code: 'golden_time',
    title: '골든 타임',
    description: '오전 5-7시 활동 10회',
    icon: '🌅',
    category: 'TIME',
    difficulty: 'MEDIUM',
    xpReward: 60,
    target: 10,
    checkType: 'earlyBird',
    checkCondition: { timeStart: 5, timeEnd: 7 }
  },
  
  // 특별 도전과제
  {
    code: 'diversity_master',
    title: '다양성의 달인',
    description: '하루 5개 카테고리 활동',
    icon: '🎨',
    category: 'SPECIAL',
    difficulty: 'HARD',
    xpReward: 100,
    target: 5,
    checkType: 'dailyCategories'
  },
  {
    code: 'marathon_runner',
    title: '마라톤 러너',
    description: '단일 활동 3시간 이상',
    icon: '🏃‍♂️',
    category: 'TIME',
    difficulty: 'HARD',
    xpReward: 80,
    target: 180,
    checkType: 'singleActivityMinutes'
  },
  {
    code: 'lightning_fingers',
    title: '번개손가락',
    description: '5분 내 3개 활동 기록',
    icon: '⚡',
    category: 'SPECIAL',
    difficulty: 'EASY',
    xpReward: 30,
    target: 3,
    checkType: 'quickEntry',
    checkCondition: { timeWindow: 5 }
  },
  {
    code: 'weekly_mvp',
    title: '주간 MVP',
    description: '리더보드 1위 달성',
    icon: '🏆',
    category: 'SOCIAL',
    difficulty: 'LEGENDARY',
    xpReward: 200,
    target: 1,
    checkType: 'leaderboardRank'
  },
  {
    code: 'friendship_bond',
    title: '우정의 증표',
    description: '친구와 함께 학습 10회',
    icon: '🤝',
    category: 'SOCIAL',
    difficulty: 'MEDIUM',
    xpReward: 60,
    target: 10,
    checkType: 'friendStudy'
  },
  
  // 운동 관련
  {
    code: 'fitness_starter',
    title: '운동 시작',
    description: '첫 운동 활동 기록',
    icon: '💪',
    category: 'FITNESS',
    difficulty: 'EASY',
    xpReward: 15,
    target: 1,
    checkType: 'categoryCount',
    checkCondition: { category: 'EXERCISE' }
  },
  {
    code: 'morning_workout',
    title: '아침 운동',
    description: '오전 6시 이전 운동 5회',
    icon: '🌄',
    category: 'FITNESS',
    difficulty: 'MEDIUM',
    xpReward: 50,
    target: 5,
    checkType: 'categoryTime',
    checkCondition: { category: 'EXERCISE', timeBefore: 6 }
  },
  {
    code: 'fitness_champion',
    title: '운동 챔피언',
    description: '운동 활동 50회 달성',
    icon: '🏅',
    category: 'FITNESS',
    difficulty: 'HARD',
    xpReward: 100,
    target: 50,
    checkType: 'categoryCount',
    checkCondition: { category: 'EXERCISE' }
  },
  {
    code: 'daily_exercise',
    title: '매일 운동',
    description: '7일 연속 운동 활동',
    icon: '🔥',
    category: 'FITNESS',
    difficulty: 'MEDIUM',
    xpReward: 70,
    target: 7,
    checkType: 'categoryStreak',
    checkCondition: { category: 'EXERCISE' }
  },
  
  // 독서 관련
  {
    code: 'bookworm_beginner',
    title: '책벌레 입문',
    description: '독서 활동 10회',
    icon: '📚',
    category: 'READING',
    difficulty: 'EASY',
    xpReward: 30,
    target: 10,
    checkType: 'categoryCount',
    checkCondition: { category: 'READING' }
  },
  {
    code: 'reading_marathon',
    title: '독서 마라톤',
    description: '총 독서 시간 20시간',
    icon: '📖',
    category: 'READING',
    difficulty: 'MEDIUM',
    xpReward: 80,
    target: 1200,
    checkType: 'categoryMinutes',
    checkCondition: { category: 'READING' }
  },
  {
    code: 'night_reader',
    title: '밤의 독서가',
    description: '오후 9시 이후 독서 10회',
    icon: '🌃',
    category: 'READING',
    difficulty: 'MEDIUM',
    xpReward: 60,
    target: 10,
    checkType: 'categoryTime',
    checkCondition: { category: 'READING', timeAfter: 21 }
  },
  {
    code: 'reading_week',
    title: '독서 주간',
    description: '일주일 매일 독서',
    icon: '🎯',
    category: 'READING',
    difficulty: 'MEDIUM',
    xpReward: 70,
    target: 7,
    checkType: 'categoryStreak',
    checkCondition: { category: 'READING' }
  },
  
  // 시간 관련
  {
    code: 'hundred_hours',
    title: '100시간 달성',
    description: '총 학습 시간 100시간',
    icon: '⏰',
    category: 'TIME',
    difficulty: 'HARD',
    xpReward: 200,
    target: 6000,
    checkType: 'totalMinutes'
  },
  {
    code: 'early_bird_week',
    title: '일주일 얼리버드',
    description: '7일 연속 오전 활동',
    icon: '🐦',
    category: 'TIME',
    difficulty: 'HARD',
    xpReward: 100,
    target: 7,
    checkType: 'morningStreak',
    checkCondition: { timeBefore: 12 }
  },
  {
    code: 'night_owl_week',
    title: '일주일 올빼미',
    description: '7일 연속 야간 활동',
    icon: '🦉',
    category: 'TIME',
    difficulty: 'HARD',
    xpReward: 100,
    target: 7,
    checkType: 'nightStreak',
    checkCondition: { timeAfter: 20 }
  },
  
  // 레벨 관련
  {
    code: 'level_10',
    title: '레벨 10 달성',
    description: '레벨 10에 도달',
    icon: '🎖️',
    category: 'LEVEL',
    difficulty: 'EASY',
    xpReward: 50,
    target: 10,
    checkType: 'level'
  },
  {
    code: 'level_25',
    title: '레벨 25 달성',
    description: '레벨 25에 도달',
    icon: '🏆',
    category: 'LEVEL',
    difficulty: 'MEDIUM',
    xpReward: 100,
    target: 25,
    checkType: 'level'
  },
  {
    code: 'level_50',
    title: '레벨 50 달성',
    description: '레벨 50에 도달',
    icon: '👑',
    category: 'LEVEL',
    difficulty: 'HARD',
    xpReward: 200,
    target: 50,
    checkType: 'level'
  },
  {
    code: 'level_100',
    title: '레벨 100 달성',
    description: '최고 레벨 도달',
    icon: '🌟',
    category: 'LEVEL',
    difficulty: 'LEGENDARY',
    xpReward: 500,
    target: 100,
    checkType: 'level'
  },
  
  // 뽀모도로 관련
  {
    code: 'pomodoro_starter',
    title: '뽀모도로 시작',
    description: '첫 뽀모도로 세션 완료',
    icon: '🍅',
    category: 'SPECIAL',
    difficulty: 'EASY',
    xpReward: 20,
    target: 1,
    checkType: 'pomodoroSessions'
  },
  {
    code: 'pomodoro_master',
    title: '뽀모도로 마스터',
    description: '뽀모도로 세션 50회 완료',
    icon: '🍅',
    category: 'SPECIAL',
    difficulty: 'HARD',
    xpReward: 100,
    target: 50,
    checkType: 'pomodoroSessions'
  },
  {
    code: 'pomodoro_day',
    title: '뽀모도로 데이',
    description: '하루 8개 뽀모도로 완료',
    icon: '🎯',
    category: 'SPECIAL',
    difficulty: 'MEDIUM',
    xpReward: 60,
    target: 8,
    checkType: 'dailyPomodoros'
  },
  
  // 소셜 관련
  {
    code: 'social_butterfly',
    title: '소셜 나비',
    description: '친구 10명 추가',
    icon: '🦋',
    category: 'SOCIAL',
    difficulty: 'MEDIUM',
    xpReward: 50,
    target: 10,
    checkType: 'friendCount'
  },
  {
    code: 'study_group_leader',
    title: '스터디 그룹 리더',
    description: '스터디 그룹 생성',
    icon: '👥',
    category: 'SOCIAL',
    difficulty: 'EASY',
    xpReward: 30,
    target: 1,
    checkType: 'groupsCreated'
  },
  {
    code: 'group_study_pro',
    title: '그룹 스터디 프로',
    description: '그룹 활동 20회 참여',
    icon: '🎓',
    category: 'SOCIAL',
    difficulty: 'MEDIUM',
    xpReward: 70,
    target: 20,
    checkType: 'groupActivities'
  },
  
  // 균형 관련
  {
    code: 'balanced_life',
    title: '균형잡힌 삶',
    description: '모든 카테고리 활동 기록',
    icon: '⚖️',
    category: 'SPECIAL',
    difficulty: 'MEDIUM',
    xpReward: 80,
    target: 6,
    checkType: 'uniqueCategories'
  },
  {
    code: 'perfect_balance',
    title: '완벽한 균형',
    description: '각 카테고리 10회 이상 활동',
    icon: '☯️',
    category: 'SPECIAL',
    difficulty: 'HARD',
    xpReward: 150,
    target: 60,
    checkType: 'balancedActivities',
    checkCondition: { minPerCategory: 10 }
  },
  
  // 연속 달성
  {
    code: 'week_warrior',
    title: '주간 전사',
    description: '일주일 연속 활동',
    icon: '⚔️',
    category: 'STREAK',
    difficulty: 'EASY',
    xpReward: 50,
    target: 7,
    checkType: 'consecutiveDays'
  },
  {
    code: 'fortnight_fighter',
    title: '2주 파이터',
    description: '14일 연속 활동',
    icon: '🗡️',
    category: 'STREAK',
    difficulty: 'MEDIUM',
    xpReward: 100,
    target: 14,
    checkType: 'consecutiveDays'
  },
  {
    code: 'monthly_champion',
    title: '월간 챔피언',
    description: '30일 연속 활동',
    icon: '🏆',
    category: 'STREAK',
    difficulty: 'HARD',
    xpReward: 200,
    target: 30,
    checkType: 'consecutiveDays'
  },
  {
    code: 'quarterly_legend',
    title: '분기 레전드',
    description: '90일 연속 활동',
    icon: '🌟',
    category: 'STREAK',
    difficulty: 'LEGENDARY',
    xpReward: 500,
    target: 90,
    checkType: 'consecutiveDays'
  },
  
  // 특수 활동
  {
    code: 'volunteer_hero',
    title: '봉사 영웅',
    description: '봉사 활동 10회',
    icon: '🦸',
    category: 'SPECIAL',
    difficulty: 'MEDIUM',
    xpReward: 80,
    target: 10,
    checkType: 'categoryCount',
    checkCondition: { category: 'VOLUNTEER' }
  },
  {
    code: 'hobby_enthusiast',
    title: '취미 열정가',
    description: '취미 활동 20회',
    icon: '🎨',
    category: 'SPECIAL',
    difficulty: 'MEDIUM',
    xpReward: 60,
    target: 20,
    checkType: 'categoryCount',
    checkCondition: { category: 'HOBBY' }
  },
  
  // 생산성 관련
  {
    code: 'productive_morning',
    title: '생산적인 아침',
    description: '오전에 3시간 이상 활동',
    icon: '☀️',
    category: 'TIME',
    difficulty: 'MEDIUM',
    xpReward: 60,
    target: 180,
    checkType: 'morningMinutes',
    checkCondition: { timeBefore: 12 }
  },
  {
    code: 'afternoon_grind',
    title: '오후 집중',
    description: '오후에 4시간 이상 활동',
    icon: '🌤️',
    category: 'TIME',
    difficulty: 'MEDIUM',
    xpReward: 70,
    target: 240,
    checkType: 'afternoonMinutes',
    checkCondition: { timeStart: 12, timeEnd: 18 }
  },
  
  // 목표 달성
  {
    code: 'goal_setter',
    title: '목표 설정자',
    description: '일일 계획 10개 생성',
    icon: '🎯',
    category: 'SPECIAL',
    difficulty: 'EASY',
    xpReward: 30,
    target: 10,
    checkType: 'plansCreated'
  },
  {
    code: 'goal_achiever',
    title: '목표 달성자',
    description: '일일 계획 100% 완료 10회',
    icon: '✅',
    category: 'SPECIAL',
    difficulty: 'HARD',
    xpReward: 120,
    target: 10,
    checkType: 'perfectDays'
  },
  
  // 집중력 관련
  {
    code: 'focus_master',
    title: '집중의 달인',
    description: '2시간 연속 학습 (휴식 없이)',
    icon: '🧘',
    category: 'SPECIAL',
    difficulty: 'HARD',
    xpReward: 80,
    target: 120,
    checkType: 'continuousMinutes'
  },
  {
    code: 'deep_work',
    title: '딥 워크',
    description: '4시간 집중 세션 완료',
    icon: '🧠',
    category: 'SPECIAL',
    difficulty: 'LEGENDARY',
    xpReward: 150,
    target: 240,
    checkType: 'deepWorkSession'
  }
]

// 월별 테마 도전과제
export const monthlyAchievements: AchievementDefinition[] = [
  // 1월 - 새해 결심
  {
    code: 'january_resolution',
    title: '새해 결심 지키기',
    description: '1월 매일 활동 기록',
    icon: '🎊',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 200,
    target: 31,
    checkType: 'monthlyDays',
    isMonthly: true,
    activeMonth: 1
  },
  {
    code: 'january_fresh_start',
    title: '새로운 시작',
    description: '1월에 새로운 카테고리 3개 도전',
    icon: '🌱',
    category: 'MONTHLY',
    difficulty: 'MEDIUM',
    xpReward: 100,
    target: 3,
    checkType: 'newCategories',
    isMonthly: true,
    activeMonth: 1
  },
  
  // 2월 - 사랑과 우정
  {
    code: 'february_love',
    title: '사랑의 학습',
    description: '친구와 함께 14회 학습',
    icon: '💝',
    category: 'MONTHLY',
    difficulty: 'MEDIUM',
    xpReward: 100,
    target: 14,
    checkType: 'friendStudy',
    isMonthly: true,
    activeMonth: 2
  },
  {
    code: 'february_duo',
    title: '듀오 챌린지',
    description: '2월에 친구 2명과 함께 활동',
    icon: '👫',
    category: 'MONTHLY',
    difficulty: 'EASY',
    xpReward: 60,
    target: 2,
    checkType: 'uniqueFriends',
    isMonthly: true,
    activeMonth: 2
  },
  
  // 3월 - 봄의 시작
  {
    code: 'march_spring',
    title: '봄맞이 도약',
    description: '3월에 레벨 5 상승',
    icon: '🌸',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 150,
    target: 5,
    checkType: 'monthlyLevelUp',
    isMonthly: true,
    activeMonth: 3
  },
  {
    code: 'march_outdoor',
    title: '야외 활동가',
    description: '운동 활동 20회',
    icon: '🌳',
    category: 'MONTHLY',
    difficulty: 'MEDIUM',
    xpReward: 80,
    target: 20,
    checkType: 'categoryCount',
    checkCondition: { category: 'EXERCISE' },
    isMonthly: true,
    activeMonth: 3
  },
  
  // 4월 - 벚꽃과 성장
  {
    code: 'april_bloom',
    title: '벚꽃 스프린트',
    description: '4월 총 100시간 달성',
    icon: '🌺',
    category: 'MONTHLY',
    difficulty: 'LEGENDARY',
    xpReward: 300,
    target: 6000,
    checkType: 'monthlyMinutes',
    isMonthly: true,
    activeMonth: 4
  },
  {
    code: 'april_growth',
    title: '성장의 달',
    description: '모든 능력치 5 상승',
    icon: '📊',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 150,
    target: 25,
    checkType: 'totalStatGrowth',
    isMonthly: true,
    activeMonth: 4
  },
  
  // 5월 - 가정의 달
  {
    code: 'may_family',
    title: '가족과 함께',
    description: '주말마다 활동 기록 (4주)',
    icon: '👨‍👩‍👧‍👦',
    category: 'MONTHLY',
    difficulty: 'MEDIUM',
    xpReward: 100,
    target: 8,
    checkType: 'weekendDays',
    isMonthly: true,
    activeMonth: 5
  },
  {
    code: 'may_gratitude',
    title: '감사의 마음',
    description: '봉사 활동 5회',
    icon: '🙏',
    category: 'MONTHLY',
    difficulty: 'MEDIUM',
    xpReward: 80,
    target: 5,
    checkType: 'categoryCount',
    checkCondition: { category: 'VOLUNTEER' },
    isMonthly: true,
    activeMonth: 5
  },
  
  // 6월 - 중간 점검
  {
    code: 'june_midyear',
    title: '상반기 결산',
    description: '상반기 목표 50% 달성',
    icon: '📈',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 200,
    target: 50,
    checkType: 'yearlyProgress',
    isMonthly: true,
    activeMonth: 6
  },
  {
    code: 'june_consistency',
    title: '꾸준함의 힘',
    description: '6월 매일 최소 1시간',
    icon: '💪',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 150,
    target: 30,
    checkType: 'dailyMinimum',
    checkCondition: { minMinutes: 60 },
    isMonthly: true,
    activeMonth: 6
  },
  
  // 7월 - 여름 특훈
  {
    code: 'july_summer',
    title: '여름 특훈',
    description: '운동 총 20시간',
    icon: '☀️',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 150,
    target: 1200,
    checkType: 'categoryMinutes',
    checkCondition: { category: 'EXERCISE' },
    isMonthly: true,
    activeMonth: 7
  },
  {
    code: 'july_early',
    title: '여름 얼리버드',
    description: '오전 6시 이전 활동 15회',
    icon: '🌅',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 120,
    target: 15,
    checkType: 'earlyActivities',
    checkCondition: { timeBefore: 6 },
    isMonthly: true,
    activeMonth: 7
  },
  
  // 8월 - 독서의 계절
  {
    code: 'august_reading',
    title: '독서의 계절',
    description: '독서 30시간 달성',
    icon: '📚',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 180,
    target: 1800,
    checkType: 'categoryMinutes',
    checkCondition: { category: 'READING' },
    isMonthly: true,
    activeMonth: 8
  },
  {
    code: 'august_knowledge',
    title: '지식 탐구자',
    description: '다양한 주제 5개 탐구',
    icon: '🔍',
    category: 'MONTHLY',
    difficulty: 'MEDIUM',
    xpReward: 100,
    target: 5,
    checkType: 'uniqueTopics',
    isMonthly: true,
    activeMonth: 8
  },
  
  // 9월 - 가을 수확
  {
    code: 'september_harvest',
    title: '가을 수확',
    description: '누적 500시간 달성',
    icon: '🌾',
    category: 'MONTHLY',
    difficulty: 'LEGENDARY',
    xpReward: 400,
    target: 30000,
    checkType: 'totalMinutes',
    isMonthly: true,
    activeMonth: 9
  },
  {
    code: 'september_focus',
    title: '집중의 계절',
    description: '뽀모도로 100회',
    icon: '🍂',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 150,
    target: 100,
    checkType: 'pomodoroSessions',
    isMonthly: true,
    activeMonth: 9
  },
  
  // 10월 - 할로윈
  {
    code: 'october_halloween',
    title: '할로윈 챌린지',
    description: '밤 10시 이후 활동 13회',
    icon: '🎃',
    category: 'MONTHLY',
    difficulty: 'MEDIUM',
    xpReward: 100,
    target: 13,
    checkType: 'nightActivities',
    checkCondition: { timeAfter: 22 },
    isMonthly: true,
    activeMonth: 10
  },
  {
    code: 'october_mystery',
    title: '미스터리 퀘스트',
    description: '숨겨진 도전과제 3개 달성',
    icon: '🔮',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 150,
    target: 3,
    checkType: 'hiddenAchievements',
    isMonthly: true,
    activeMonth: 10
  },
  
  // 11월 - 감사
  {
    code: 'november_thanks',
    title: '감사의 달',
    description: '봉사 활동 10회',
    icon: '🦃',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 150,
    target: 10,
    checkType: 'categoryCount',
    checkCondition: { category: 'VOLUNTEER' },
    isMonthly: true,
    activeMonth: 11
  },
  {
    code: 'november_sharing',
    title: '나눔의 정신',
    description: '친구 5명과 함께 활동',
    icon: '🤲',
    category: 'MONTHLY',
    difficulty: 'MEDIUM',
    xpReward: 100,
    target: 5,
    checkType: 'uniqueFriends',
    isMonthly: true,
    activeMonth: 11
  },
  
  // 12월 - 연말
  {
    code: 'december_finale',
    title: '연말 결산',
    description: '연간 목표 달성',
    icon: '🎄',
    category: 'MONTHLY',
    difficulty: 'LEGENDARY',
    xpReward: 500,
    target: 100,
    checkType: 'yearlyGoal',
    isMonthly: true,
    activeMonth: 12
  },
  {
    code: 'december_celebration',
    title: '축하의 달',
    description: '레벨 10 상승',
    icon: '🎉',
    category: 'MONTHLY',
    difficulty: 'HARD',
    xpReward: 200,
    target: 10,
    checkType: 'monthlyLevelUp',
    isMonthly: true,
    activeMonth: 12
  }
]

// 모든 도전과제
export const allAchievements = [...baseAchievements, ...monthlyAchievements]

// 월별 활성 도전과제 가져오기
export function getActiveAchievements(month: number): AchievementDefinition[] {
  return allAchievements.filter(achievement => 
    !achievement.isMonthly || achievement.activeMonth === month
  )
}

// 난이도별 도전과제 필터링
export function getAchievementsByDifficulty(difficulty: AchievementDifficulty): AchievementDefinition[] {
  return allAchievements.filter(achievement => achievement.difficulty === difficulty)
}

// 카테고리별 도전과제 필터링
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return allAchievements.filter(achievement => achievement.category === category)
}

// 월별 랜덤 도전과제 선택 (난이도 균형 맞추기)
export function selectMonthlyRandomAchievements(month: number): AchievementDefinition[] {
  const monthlyPool = monthlyAchievements.filter(a => a.activeMonth === month)
  const selected: AchievementDefinition[] = []
  
  // 월별 특별 도전과제 추가
  selected.push(...monthlyPool)
  
  // 난이도별로 추가 도전과제 선택
  const difficulties: AchievementDifficulty[] = ['EASY', 'MEDIUM', 'HARD']
  const counts: Record<string, number> = { EASY: 2, MEDIUM: 3, HARD: 2, LEGENDARY: 1 }
  
  difficulties.forEach(difficulty => {
    const available = baseAchievements.filter(a => 
      a.difficulty === difficulty && 
      !selected.some(s => s.code === a.code)
    )
    
    const count = Math.min(counts[difficulty] || 0, available.length)
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * available.length)
      const achievement = available.splice(randomIndex, 1)[0]
      if (achievement) selected.push(achievement)
    }
  })
  
  return selected
}