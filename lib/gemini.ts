import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

export interface CharacterStats {
  level: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  charisma: number;
  vitality: number;
  totalXP: number;
  totalMinutes: number;
  name?: string;
}

// 랜덤 캐릭터 타입 선택
function getRandomCharacterType(): { type: string; description: string } {
  const characterTypes = [
    // 인간형 (성별 다양화)
    { type: "Human Male", description: "young male student hero" },
    { type: "Human Female", description: "young female student hero" },
    { type: "Human Non-binary", description: "young non-binary student hero" },
    
    // 동물 캐릭터
    { type: "Cat Warrior", description: "adorable cat student with human-like posture" },
    { type: "Wolf Scholar", description: "wise wolf student with scholarly appearance" },
    { type: "Fox Mage", description: "clever fox student with magical abilities" },
    { type: "Dragon Student", description: "young dragon student in humanoid form" },
    { type: "Owl Sage", description: "intelligent owl student with wise demeanor" },
    { type: "Bear Guardian", description: "strong bear student with protective nature" },
    { type: "Rabbit Speedster", description: "quick rabbit student with energetic pose" },
    
    // 과일/식물 캐릭터
    { type: "Apple Scholar", description: "cute apple character with student accessories" },
    { type: "Strawberry Mage", description: "sweet strawberry character with magical powers" },
    { type: "Pineapple Warrior", description: "tough pineapple character with armor" },
    { type: "Cherry Twin", description: "twin cherry characters working together" },
    { type: "Sunflower Healer", description: "bright sunflower character with healing aura" },
    
    // 사물/원소 캐릭터
    { type: "Book Spirit", description: "living book character with pages as wings" },
    { type: "Crystal Guardian", description: "mystical crystal being with gem-like appearance" },
    { type: "Star Student", description: "star-shaped character with celestial glow" },
    { type: "Clock Keeper", description: "mechanical clock character with time powers" },
    { type: "Pencil Warrior", description: "heroic pencil character with writing powers" }
  ];
  
  return characterTypes[Math.floor(Math.random() * characterTypes.length)];
}

// 능력치 기반 캐릭터 설명 생성
function generateCharacterDescription(stats: CharacterStats): {
  characterType: string;
  characterDescription: string;
  characterClass: string;
  characterStyle: string;
  levelEffect: string;
} {
  const { level, strength, intelligence, dexterity, charisma, vitality } = stats;
  
  // 랜덤 캐릭터 타입 선택
  const characterType = getRandomCharacterType();
  
  // 주요 스탯 결정
  const maxStat = Math.max(strength, intelligence, dexterity, charisma, vitality);
  let characterClass = "Balanced Student";
  let characterStyle = "well-rounded abilities";
  
  if (intelligence === maxStat) {
    characterClass = "Arcane Scholar";
    characterStyle = "magical aura, glowing books, mystical symbols, scholarly accessories";
  } else if (strength === maxStat) {
    characterClass = "Mighty Warrior";
    characterStyle = "strong build, protective gear, powerful stance, athletic appearance";
  } else if (dexterity === maxStat) {
    characterClass = "Swift Adventurer";
    characterStyle = "agile pose, light equipment, dynamic movement, quick reflexes";
  } else if (charisma === maxStat) {
    characterClass = "Charismatic Leader";
    characterStyle = "confident expression, radiant presence, leadership aura, inspiring pose";
  } else if (vitality === maxStat) {
    characterClass = "Resilient Guardian";
    characterStyle = "sturdy appearance, protective stance, enduring spirit, healthy glow";
  }
  
  // 레벨에 따른 효과
  let levelEffect = "";
  if (level >= 40) {
    levelEffect = "legendary golden aura, divine light effects, epic background, masterful equipment";
  } else if (level >= 30) {
    levelEffect = "heroic silver glow, advanced accessories, dramatic lighting, skilled appearance";
  } else if (level >= 20) {
    levelEffect = "bronze energy field, quality gear, confident pose, experienced look";
  } else {
    levelEffect = "beginner's enthusiasm, basic equipment, hopeful expression, eager to learn";
  }
  
  return {
    characterType: characterType.type,
    characterDescription: characterType.description,
    characterClass,
    characterStyle,
    levelEffect
  };
}

// 이미지 생성 프롬프트 생성
export function generateImagePrompt(stats: CharacterStats): string {
  const characterDesc = generateCharacterDescription(stats);
  const totalHours = Math.floor(stats.totalMinutes / 60);
  
  return `Create a high-quality anime/manga style character card for a Level ${stats.level} student.

Character Details:
- Type: ${characterDesc.characterType} - ${characterDesc.characterDescription}
- Class: ${characterDesc.characterClass}
- Style: ${characterDesc.characterStyle}
- Level Effects: ${characterDesc.levelEffect}
- Stats Display: STR ${stats.strength} | INT ${stats.intelligence} | DEX ${stats.dexterity} | CHA ${stats.charisma} | VIT ${stats.vitality}
- Experience: ${stats.totalXP} XP earned through ${totalHours} hours of study

Visual Requirements:
- Character should be a ${characterDesc.characterDescription} in a heroic/academic pose
- Elegant RPG-style card frame with ornate borders and decorative elements
- Level ${stats.level} prominently displayed at the top in bold numbers
- Stat bars or icons showing the five attributes (STR, INT, DEX, CHA, VIT)
- Fantasy academy/magical school background with books, scrolls, or study elements
- Color scheme based on level tier:
  * Bronze theme (10-19): Warm browns and golds
  * Silver theme (20-29): Cool silvers and blues  
  * Gold theme (30-39): Rich golds and purples
  * Legendary theme (40+): Rainbow and divine colors
- Inspirational and motivational atmosphere with sparkles and energy effects
- Clean, professional trading card game design
- Korean webtoon/manhwa art style with vibrant colors
- Include study-related props or magical academic items appropriate to the character type

Art Style Notes:
- If animal character: anthropomorphic with student uniform or academic robes
- If fruit/plant character: cute chibi style with face and limbs, wearing study accessories
- If object character: personified with cute face, eyes, and student gear
- If human character: diverse representation with appropriate gender expression

The card should inspire students to continue their learning journey and make studying feel like an adventure!`;
}

// 이미지 생성 및 저장
export async function generateLevelImage(stats: CharacterStats): Promise<{
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  error?: string;
}> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      console.warn("GEMINI_API_KEY is not set, using placeholder image");
      
      // API 키가 없을 때 플레이스홀더 이미지 생성
      const dirPath = path.join(process.cwd(), 'public', 'level-cards');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // SVG로 간단한 카드 생성
      const svgContent = createPlaceholderSVG(stats);
      const fileName = `placeholder-level-${stats.level}-${Date.now()}.svg`;
      const filePath = path.join(dirPath, fileName);
      fs.writeFileSync(filePath, svgContent);
      
      return {
        success: true,
        imageUrl: `/level-cards/${fileName}`,
        prompt: "Placeholder image (Gemini API key not configured)"
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = generateImagePrompt(stats);
    
    console.log("Generating image with Gemini prompt:", prompt);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });
    
    // 이미지 데이터 추출
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          console.log("Text response:", part.text);
        } else if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data;
          
          // 이미지 저장 경로 생성
          const timestamp = Date.now();
          const fileName = `level-${stats.level}-${timestamp}.png`;
          const dirPath = path.join(process.cwd(), 'public', 'level-cards');
          const filePath = path.join(dirPath, fileName);
          
          // 디렉토리 생성
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          
          // Base64를 버퍼로 변환하여 저장
          const buffer = Buffer.from(imageData, 'base64');
          fs.writeFileSync(filePath, buffer);
          
          const imageUrl = `/level-cards/${fileName}`;
          
          console.log(`Image saved: ${imageUrl}`);
          
          return {
            success: true,
            imageUrl,
            prompt
          };
        }
      }
    }
    
    return {
      success: false,
      error: "이미지 생성에 실패했습니다. 이미지 데이터를 받지 못했습니다."
    };
    
  } catch (error) {
    console.error("Image generation error:", error);
    
    // 에러 시에도 플레이스홀더 이미지 생성
    const dirPath = path.join(process.cwd(), 'public', 'level-cards');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const svgContent = createPlaceholderSVG(stats);
    const fileName = `placeholder-level-${stats.level}-${Date.now()}.svg`;
    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, svgContent);
    
    return {
      success: true,
      imageUrl: `/level-cards/${fileName}`,
      prompt: "Placeholder image (API error)",
      error: error instanceof Error ? error.message : "이미지 생성 중 오류가 발생했습니다."
    };
  }
}

// 플레이스홀더 SVG 생성
function createPlaceholderSVG(stats: CharacterStats): string {
  const { level, strength, intelligence, dexterity, charisma, vitality, totalXP, totalMinutes } = stats;
  const totalHours = Math.floor(totalMinutes / 60);
  
  // 레벨에 따른 색상
  let bgGradient = "from='#9CA3AF' to='#6B7280'"; // 기본 회색
  let tierLabel = "초보자";
  if (level >= 40) {
    bgGradient = "from='#F59E0B' to='#D97706'"; // 금색
    tierLabel = "전설";
  } else if (level >= 30) {
    bgGradient = "from='#8B5CF6' to='#7C3AED'"; // 보라색
    tierLabel = "영웅";
  } else if (level >= 20) {
    bgGradient = "from='#3B82F6' to='#2563EB'"; // 파란색
    tierLabel = "엘리트";
  }
  
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
      ${tierLabel} 등급
    </text>
    
    <!-- Character Icon Placeholder -->
    <circle cx="256" cy="230" r="60" fill="#E5E7EB"/>
    <text x="256" y="240" font-family="Arial, sans-serif" font-size="48" text-anchor="middle">👤</text>
    
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
      Gemini AI 이미지 생성 대기 중
    </text>
    
    <!-- Footer -->
    <text x="256" y="470" font-family="Arial, sans-serif" font-size="10" fill="#D1D5DB" text-anchor="middle">
      성장닷컴 Level Card
    </text>
  </svg>`;
}

// 레벨업 체크 및 이미지 생성 트리거
export function shouldGenerateLevelImage(currentLevel: number, previousLevel: number): boolean {
  // 10의 배수 레벨에 도달했는지 확인
  const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  for (const milestone of milestones) {
    if (currentLevel >= milestone && previousLevel < milestone) {
      return true;
    }
  }
  
  return false;
}