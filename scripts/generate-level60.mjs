// Level 60 이미지 생성 스크립트 for 김시온
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 김시온 학생 스탯
const stats = {
  level: 60,
  strength: 277,
  intelligence: 2798,
  wisdom: 10,
  dexterity: 10,
  charisma: 87,
  vitality: 113,
  totalXP: 34889,
  totalMinutes: 16768  // INT * 6 estimated
};

// 캐릭터 타입 (랜덤 선택)
const characterTypes = [
  { type: "Human Male", description: "young male student hero" },
  { type: "Human Female", description: "young female student hero" },
  { type: "Human Non-binary", description: "young non-binary student hero" },
  { type: "Cat Warrior", description: "adorable cat student with human-like posture" },
  { type: "Wolf Scholar", description: "wise wolf student with scholarly appearance" },
  { type: "Fox Mage", description: "clever fox student with magical abilities" },
  { type: "Dragon Student", description: "young dragon student in humanoid form" },
  { type: "Owl Sage", description: "intelligent owl student with wise demeanor" },
  { type: "Bear Guardian", description: "strong bear student with protective nature" },
  { type: "Rabbit Speedster", description: "quick rabbit student with energetic pose" },
  { type: "Apple Scholar", description: "cute apple character with student accessories" },
  { type: "Book Spirit", description: "living book character with pages as wings" },
  { type: "Crystal Guardian", description: "mystical crystal being with gem-like appearance" },
  { type: "Star Student", description: "star-shaped character with celestial glow" }
];

const characterType = characterTypes[Math.floor(Math.random() * characterTypes.length)];

// INT가 최고 스탯이므로 Arcane Scholar
const characterClass = "Arcane Scholar";
const characterStyle = "magical aura, glowing books, mystical symbols, scholarly accessories";
const levelEffect = "legendary golden aura, divine light effects, epic background, masterful equipment";

const totalHours = Math.floor(stats.totalMinutes / 60);

const prompt = `Create a high-quality anime/manga style character card for a Level ${stats.level} student.

Character Details:
- Type: ${characterType.type} - ${characterType.description}
- Class: ${characterClass}
- Style: ${characterStyle}
- Level Effects: ${levelEffect}
- Stats Display: STR ${stats.strength} | INT ${stats.intelligence} | WIS ${stats.wisdom} | DEX ${stats.dexterity} | CHA ${stats.charisma} | VIT ${stats.vitality}
- Experience: ${stats.totalXP} XP earned through ${totalHours} hours of study

Visual Requirements:
- Character should be a ${characterType.description} in a heroic/academic pose
- Elegant RPG-style card frame with ornate borders and decorative elements
- Level ${stats.level} prominently displayed at the top in bold numbers
- Stat bars or icons showing the six attributes (STR, INT, WIS, DEX, CHA, VIT)
- Fantasy academy/magical school background with books, scrolls, or study elements
- Color scheme: Legendary theme (40+): Rainbow and divine colors
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

async function generateImage() {
  console.log("=== Level 60 이미지 생성 시작 ===");
  console.log("캐릭터 타입:", characterType.type);
  console.log("캐릭터 클래스:", characterClass);
  console.log("");

  const apiKey = "AIzaSyDwvTxA8Byy6XMvKuELCSPgzs1XRNh54fQ";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

  console.log("Gemini API 호출 중...");

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          console.log("텍스트 응답:", part.text);
        } else if (part.inlineData && part.inlineData.data) {
          console.log("이미지 데이터 수신 완료!");

          const imageData = part.inlineData.data;
          const timestamp = Date.now();
          const fileName = `level-60-${timestamp}.png`;

          // 백업 디렉토리에 저장
          const backupDir = path.join(__dirname, '..', 'public', 'level-cards-backup');
          const filePath = path.join(backupDir, fileName);

          if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
          }

          const buffer = Buffer.from(imageData, 'base64');
          fs.writeFileSync(filePath, buffer);

          console.log("");
          console.log("=== 이미지 저장 완료 ===");
          console.log("파일 경로:", filePath);
          console.log("파일 크기:", (buffer.length / 1024).toFixed(2), "KB");
          console.log("");
          console.log("다음 단계:");
          console.log("1. git add public/level-cards-backup/" + fileName);
          console.log("2. git commit -m 'Add level 60 card for 김시온'");
          console.log("3. git push");
          console.log("");
          console.log("DB 업데이트 URL: /level-cards-backup/" + fileName);

          return fileName;
        }
      }
    }

    console.error("이미지 데이터를 받지 못했습니다.");
    return null;

  } catch (error) {
    console.error("에러 발생:", error);
    return null;
  }
}

generateImage();
