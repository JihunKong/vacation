const { GoogleGenerativeAI } = require('@google/generative-ai')
const fs = require('fs')
const path = require('path')

async function generateFemaleScholarCard() {
  console.log('🎨 Gemini를 사용하여 여성 학자 캐릭터 카드 생성...\n')
  
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDwvTxA8Byy6XMvKuELCSPgzs1XRNh54fQ'
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY가 설정되지 않았습니다.')
    return
  }
  
  // Kim Sion's actual stats from database
  const stats = {
    level: 10,
    strength: 19,
    intelligence: 127,
    dexterity: 10,
    charisma: 16,
    vitality: 10,
    totalXP: 1686,
    totalMinutes: 17 * 60 // 17 hours
  }

  // Force female character type
  const characterType = { type: "Human Female", description: "young female student hero" }
  const characterClass = "Arcane Scholar" // Based on high INT
  const characterStyle = "magical aura, glowing books, mystical symbols, scholarly accessories"
  const levelEffect = "beginner's enthusiasm, basic equipment, hopeful expression, eager to learn"
  const totalHours = Math.floor(stats.totalMinutes / 60)

  const prompt = `Create a high-quality anime/manga style character card for a Level ${stats.level} student.

Character Details:
- Type: ${characterType.type} - ${characterType.description}
- Class: ${characterClass}
- Style: ${characterStyle}
- Level Effects: ${levelEffect}
- Stats Display: STR ${stats.strength} | INT ${stats.intelligence} | DEX ${stats.dexterity} | CHA ${stats.charisma} | VIT ${stats.vitality}
- Experience: ${stats.totalXP} XP earned through ${totalHours} hours of study

Visual Requirements:
- Character should be a ${characterType.description} in a heroic/academic pose
- Elegant RPG-style card frame with ornate borders and decorative elements
- Level ${stats.level} prominently displayed at the top in bold numbers
- Stat bars or icons showing the five attributes (STR, INT, DEX, CHA, VIT)
- Fantasy academy/magical school background with books, scrolls, or study elements
- Bronze theme (10-19): Warm browns and golds
- Inspirational and motivational atmosphere with sparkles and energy effects
- Clean, professional trading card game design
- Korean webtoon/manhwa art style with vibrant colors
- Include study-related props or magical academic items appropriate to the character type

Art Style Notes:
- Female character: diverse representation with appropriate gender expression
- High intelligence focus: Show magical scholarly abilities befitting INT ${stats.intelligence}

The card should inspire students to continue their learning journey and make studying feel like an adventure!`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })
    
    console.log('🔄 Gemini 2.5 Flash Image Preview 모델로 이미지 생성 중...')
    console.log('📝 프롬프트:', prompt.substring(0, 200) + '...')
    
    const result = await model.generateContent([prompt])
    const response = await result.response
    
    console.log('✅ Gemini 응답 받음!')
    
    // 응답에서 이미지 데이터 확인
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          console.log('🖼️ 이미지 데이터 발견! 저장 중...')
          
          const imageData = part.inlineData.data
          const mimeType = part.inlineData.mimeType
          const extension = mimeType.includes('png') ? 'png' : 'jpg'
          
          const fileName = `female-scholar-card-${Date.now()}.${extension}`
          const dirPath = path.join(__dirname, '../public/level-cards')
          const filePath = path.join(dirPath, fileName)
          
          // 디렉토리 생성
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
          }
          
          // Base64를 버퍼로 변환하여 저장
          const buffer = Buffer.from(imageData, 'base64')
          fs.writeFileSync(filePath, buffer)
          
          console.log(`✅ 이미지 저장 완료: /level-cards/${fileName}`)
          console.log(`📊 파일 크기: ${buffer.length} bytes`)
          
          return {
            success: true,
            imageUrl: `/level-cards/${fileName}`,
            fileName: fileName,
            prompt: prompt
          }
        }
      }
    }
    
    // 텍스트 응답만 있는 경우
    console.log('📄 Gemini 텍스트 응답:')
    console.log(text)
    
    // 응답을 파일로 저장
    const responseFile = `female-scholar-gemini-response-${Date.now()}.txt`
    const responseFilePath = path.join(__dirname, '../public/level-cards', responseFile)
    fs.writeFileSync(responseFilePath, `여성 학자 캐릭터 카드 생성 요청\n\n프롬프트:\n${prompt}\n\n응답:\n${text}`)
    
    console.log(`💾 응답 저장: /level-cards/${responseFile}`)
    console.log('\n💡 참고: 현재 Gemini 1.5 Flash는 텍스트 생성 모델입니다.')
    console.log('🖼️ 이미지 생성을 위해서는 Imagen 3 또는 다른 이미지 생성 API가 필요합니다.')
    
    return {
      success: false,
      error: '이미지 데이터 없음 (텍스트 모델)',
      responseFile: responseFile,
      prompt: prompt
    }
    
  } catch (error) {
    console.error('❌ Gemini API 오류:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// 실행
generateFemaleScholarCard()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 여성 학자 카드 생성 성공!')
      console.log(`🖼️ 파일: ${result.fileName}`)
      console.log('📋 다음 단계: 서버에 업로드 후 데이터베이스 업데이트')
    } else {
      console.log('\n💔 이미지 생성 실패')
      console.log(`⚠️ 오류: ${result.error}`)
      if (result.responseFile) {
        console.log(`📄 응답 파일: ${result.responseFile}`)
      }
    }
  })
  .catch(error => {
    console.error('💥 스크립트 실행 오류:', error)
  })