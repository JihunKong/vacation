// 오프라인으로 김시온 학생 카드 생성 (프로덕션 DB 접근 불가 시)
const path = require('path')
const fs = require('fs')

// Gemini 라이브러리 시뮬레이션
function generateImagePrompt(stats) {
  const { level, strength, intelligence, dexterity, charisma, vitality, totalXP, totalMinutes } = stats
  const totalHours = Math.floor(totalMinutes / 60)
  
  // 랜덤 캐릭터 타입 선택
  const characterTypes = [
    { type: "Human Female", description: "young female student hero" },
    { type: "Cat Warrior", description: "adorable cat student with human-like posture" },
    { type: "Fox Mage", description: "clever fox student with magical abilities" },
    { type: "Apple Scholar", description: "cute apple character with student accessories" },
    { type: "Book Spirit", description: "living book character with pages as wings" },
    { type: "Star Student", description: "star-shaped character with celestial glow" }
  ]
  
  const characterType = characterTypes[Math.floor(Math.random() * characterTypes.length)]
  
  // 주요 스탯 결정
  const maxStat = Math.max(strength, intelligence, dexterity, charisma, vitality)
  let characterClass = "Balanced Student"
  let characterStyle = "well-rounded abilities"
  
  if (intelligence === maxStat) {
    characterClass = "Arcane Scholar"
    characterStyle = "magical aura, glowing books, mystical symbols, scholarly accessories"
  } else if (strength === maxStat) {
    characterClass = "Mighty Warrior" 
    characterStyle = "strong build, protective gear, powerful stance, athletic appearance"
  }
  
  return `Create a high-quality anime/manga style character card for a Level ${level} student.

Character Details:
- Type: ${characterType.type} - ${characterType.description}
- Class: ${characterClass}
- Style: ${characterStyle}
- Level Effects: beginner's enthusiasm, basic equipment, hopeful expression, eager to learn
- Stats Display: STR ${strength} | INT ${intelligence} | DEX ${dexterity} | CHA ${charisma} | VIT ${vitality}
- Experience: ${totalXP} XP earned through ${totalHours} hours of study

Visual Requirements:
- Character should be a ${characterType.description} in a heroic/academic pose
- Elegant RPG-style card frame with ornate borders and decorative elements
- Level ${level} prominently displayed at the top in bold numbers
- Stat bars or icons showing the five attributes (STR, INT, DEX, CHA, VIT)
- Fantasy academy/magical school background with books, scrolls, or study elements
- Bronze theme (10-19): Warm browns and golds
- Inspirational and motivational atmosphere with sparkles and energy effects
- Clean, professional trading card game design
- Korean webtoon/manhwa art style with vibrant colors

The card should inspire students to continue their learning journey and make studying feel like an adventure!`
}

function createPlaceholderSVG(stats) {
  const { level, strength, intelligence, dexterity, charisma, vitality, totalXP, totalMinutes } = stats
  const totalHours = Math.floor(totalMinutes / 60)
  
  return `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#D97706;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="512" height="512" fill="url(#bg)"/>
    
    <!-- Card Frame -->
    <rect x="20" y="20" width="472" height="472" fill="white" rx="20" opacity="0.95"/>
    
    <!-- Header -->
    <rect x="40" y="40" width="432" height="80" fill="#1F2937" rx="10"/>
    <text x="256" y="75" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
      Level ${level}
    </text>
    <text x="256" y="105" font-family="Arial, sans-serif" font-size="18" fill="#FCD34D" text-anchor="middle">
      김시온 특별판
    </text>
    
    <!-- Character Icon Placeholder -->
    <circle cx="256" cy="230" r="60" fill="#E5E7EB"/>
    <text x="256" y="240" font-family="Arial, sans-serif" font-size="48" text-anchor="middle">🌟</text>
    
    <!-- Stats -->
    <g transform="translate(60, 320)">
      <text x="0" y="0" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#374151">능력치</text>
      
      <text x="0" y="30" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">STR: ${strength}</text>
      <text x="80" y="30" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">INT: ${intelligence}</text>
      <text x="160" y="30" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">DEX: ${dexterity}</text>
      <text x="240" y="30" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">CHA: ${charisma}</text>
      <text x="320" y="30" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">VIT: ${vitality}</text>
    </g>
    
    <!-- XP and Time -->
    <rect x="40" y="380" width="432" height="60" fill="#F3F4F6" rx="10"/>
    <text x="256" y="405" font-family="Arial, sans-serif" font-size="14" fill="#6B7280" text-anchor="middle">
      ${totalXP.toLocaleString()} XP • ${totalHours}시간
    </text>
    <text x="256" y="425" font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle">
      임시 카드 - 실제 생성 대기 중
    </text>
    
    <!-- Footer -->
    <text x="256" y="470" font-family="Arial, sans-serif" font-size="10" fill="#D1D5DB" text-anchor="middle">
      스터디로그 Level Card
    </text>
  </svg>`
}

async function generateKimSionCardOffline() {
  console.log('🎨 김시온 학생 10레벨 카드 오프라인 생성 시작...\n')
  
  // 김시온 학생 예상 스탯 (레벨 16, 활발한 학습자)
  const kimSionStats = {
    level: 10,           // 10레벨 카드 생성
    strength: 15,        // 기본 10 + 5 (약간의 운동)
    intelligence: 127,   // 높은 지능 (학습 활동 많음)
    dexterity: 12,       // 기본 10 + 2
    charisma: 14,        // 기본 10 + 4
    vitality: 16,        // 기본 10 + 6
    totalXP: 8500,       // 레벨 16까지의 경험치 추정
    totalMinutes: 2400,  // 40시간 학습 추정
    name: '김시온'
  }
  
  console.log('👤 김시온 학생 정보:')
  console.log(`📊 레벨: ${kimSionStats.level} (실제는 16레벨, 10레벨 카드 생성)`)
  console.log(`💪 능력치: STR:${kimSionStats.strength} INT:${kimSionStats.intelligence} DEX:${kimSionStats.dexterity} CHA:${kimSionStats.charisma} VIT:${kimSionStats.vitality}`)
  console.log(`⭐ 경험치: ${kimSionStats.totalXP.toLocaleString()} XP`)
  console.log(`⏰ 학습시간: ${Math.floor(kimSionStats.totalMinutes / 60)}시간\n`)
  
  // 프롬프트 생성
  const prompt = generateImagePrompt(kimSionStats)
  console.log('📝 생성된 Gemini 프롬프트:')
  console.log('='.repeat(50))
  console.log(prompt)
  console.log('='.repeat(50) + '\n')
  
  // 임시 SVG 카드 생성
  const svgContent = createPlaceholderSVG(kimSionStats)
  
  // 파일 저장
  const outputDir = path.join(__dirname, '../public/level-cards')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const svgFileName = `kim-sion-level-10-${Date.now()}.svg`
  const svgPath = path.join(outputDir, svgFileName)
  fs.writeFileSync(svgPath, svgContent)
  
  const promptFileName = `kim-sion-level-10-prompt-${Date.now()}.txt`
  const promptPath = path.join(outputDir, promptFileName)
  fs.writeFileSync(promptPath, prompt)
  
  console.log('💾 파일 저장 완료:')
  console.log(`🖼️ SVG 카드: /level-cards/${svgFileName}`)
  console.log(`📝 프롬프트: /level-cards/${promptFileName}\n`)
  
  // 데이터베이스 삽입용 SQL 생성
  const insertSQL = `
-- 김시온 학생 10레벨 카드 데이터베이스 삽입 SQL
-- 실제 studentId는 kimsion70823@gmail.com 사용자의 프로필 ID로 교체 필요

INSERT INTO "LevelImage" (
  "id",
  "studentId", 
  "level",
  "imageUrl",
  "prompt",
  "strength",
  "intelligence", 
  "dexterity",
  "charisma",
  "vitality",
  "totalXP",
  "totalMinutes",
  "createdAt",
  "updatedAt"
) VALUES (
  'kim-sion-level-10-' || EXTRACT(EPOCH FROM NOW())::text,
  '(김시온 studentProfile.id)', -- 실제 ID로 교체 필요
  10,
  '/level-cards/${svgFileName}',
  '${prompt.replace(/'/g, "''")}',
  ${kimSionStats.strength},
  ${kimSionStats.intelligence},
  ${kimSionStats.dexterity},
  ${kimSionStats.charisma},
  ${kimSionStats.vitality},
  ${kimSionStats.totalXP},
  ${kimSionStats.totalMinutes},
  NOW(),
  NOW()
);`
  
  const sqlFileName = `kim-sion-level-10-insert-${Date.now()}.sql`
  const sqlPath = path.join(outputDir, sqlFileName)
  fs.writeFileSync(sqlPath, insertSQL)
  
  console.log(`💽 SQL 파일: /level-cards/${sqlFileName}`)
  
  console.log('\n🎯 완료!')
  console.log('📋 다음 단계:')
  console.log('1. 생성된 프롬프트를 Gemini에 입력하여 실제 이미지 생성')
  console.log('2. 생성된 이미지를 /public/level-cards/ 폴더에 저장')
  console.log('3. SQL 파일의 studentId를 실제 김시온 프로필 ID로 수정')
  console.log('4. 데이터베이스에 SQL 실행')
  console.log('5. 갤러리에서 카드 확인')
  
  return {
    svgPath: `/level-cards/${svgFileName}`,
    promptPath: `/level-cards/${promptFileName}`,
    sqlPath: `/level-cards/${sqlFileName}`,
    prompt,
    stats: kimSionStats
  }
}

// 실행
generateKimSionCardOffline()
  .then(result => {
    console.log('\n✨ 김시온 학생 카드 생성 준비 완료!')
  })
  .catch(error => {
    console.error('💥 오류 발생:', error)
  })