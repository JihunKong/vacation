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

// 능력치 기반 캐릭터 설명 생성
function generateCharacterDescription(stats: CharacterStats): string {
  const { level, strength, intelligence, dexterity, charisma, vitality } = stats;
  
  // 주요 스탯 결정
  const maxStat = Math.max(strength, intelligence, dexterity, charisma, vitality);
  let characterClass = "Balanced Hero";
  let characterStyle = "well-rounded";
  
  if (intelligence === maxStat) {
    characterClass = "Arcane Scholar";
    characterStyle = "magical aura, glowing books, mystical symbols";
  } else if (strength === maxStat) {
    characterClass = "Mighty Warrior";
    characterStyle = "muscular build, heavy armor, powerful stance";
  } else if (dexterity === maxStat) {
    characterClass = "Swift Rogue";
    characterStyle = "agile pose, light armor, dynamic movement";
  } else if (charisma === maxStat) {
    characterClass = "Charismatic Leader";
    characterStyle = "confident smile, radiant presence, leadership aura";
  } else if (vitality === maxStat) {
    characterClass = "Resilient Guardian";
    characterStyle = "sturdy build, protective stance, enduring spirit";
  }
  
  // 레벨에 따른 효과
  let levelEffect = "";
  if (level >= 40) {
    levelEffect = "legendary golden aura, divine light effects, epic background";
  } else if (level >= 30) {
    levelEffect = "heroic silver glow, advanced equipment, dramatic lighting";
  } else if (level >= 20) {
    levelEffect = "bronze energy field, quality gear, confident pose";
  } else {
    levelEffect = "beginner's enthusiasm, basic equipment, hopeful expression";
  }
  
  return `${characterClass} with ${characterStyle}, ${levelEffect}`;
}

// 이미지 생성 프롬프트 생성
export function generateImagePrompt(stats: CharacterStats): string {
  const characterDesc = generateCharacterDescription(stats);
  const totalHours = Math.floor(stats.totalMinutes / 60);
  
  return `Create a high-quality anime/manga style character card for a Level ${stats.level} student hero.

Character Details:
- Class: ${characterDesc}
- Stats Display: STR ${stats.strength} | INT ${stats.intelligence} | DEX ${stats.dexterity} | CHA ${stats.charisma} | VIT ${stats.vitality}
- Experience: ${stats.totalXP} XP earned through ${totalHours} hours of dedication

Visual Requirements:
- Full body character in heroic pose
- Elegant RPG-style card frame with ornate borders
- Level ${stats.level} prominently displayed at the top
- Stat bars showing the five attributes
- Fantasy school/academy background
- Color scheme based on level tier (Bronze 10-19, Silver 20-29, Gold 30-39, Legendary 40+)
- Inspirational and motivational atmosphere
- Clean, professional game card design
- Korean RPG/Manhwa art style influence

The card should inspire students to continue their learning journey!`;
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