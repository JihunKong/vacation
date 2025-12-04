
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
  '/level-cards/kim-sion-level-10-1757486919979.svg',
  'Create a high-quality anime/manga style character card for a Level 10 student.

Character Details:
- Type: Apple Scholar - cute apple character with student accessories
- Class: Arcane Scholar
- Style: magical aura, glowing books, mystical symbols, scholarly accessories
- Level Effects: beginner''s enthusiasm, basic equipment, hopeful expression, eager to learn
- Stats Display: STR 15 | INT 127 | DEX 12 | CHA 14 | VIT 16
- Experience: 8500 XP earned through 40 hours of study

Visual Requirements:
- Character should be a cute apple character with student accessories in a heroic/academic pose
- Elegant RPG-style card frame with ornate borders and decorative elements
- Level 10 prominently displayed at the top in bold numbers
- Stat bars or icons showing the five attributes (STR, INT, DEX, CHA, VIT)
- Fantasy academy/magical school background with books, scrolls, or study elements
- Bronze theme (10-19): Warm browns and golds
- Inspirational and motivational atmosphere with sparkles and energy effects
- Clean, professional trading card game design
- Korean webtoon/manhwa art style with vibrant colors

The card should inspire students to continue their learning journey and make studying feel like an adventure!',
  15,
  127,
  12,
  14,
  16,
  8500,
  2400,
  NOW(),
  NOW()
);