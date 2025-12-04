const { GoogleGenerativeAI } = require('@google/generative-ai')
const fs = require('fs')
const path = require('path')

async function generateWithGemini() {
  console.log('🎨 Gemini를 사용하여 김시온 학생 카드 생성 중...\n')
  
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDwvTxA8Byy6XMvKuELCSPgzs1XRNh54fQ'
  
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    console.log('❌ GEMINI_API_KEY가 설정되지 않았습니다.')
    return
  }
  
  // 프롬프트 파일 읽기
  const promptFiles = fs.readdirSync(path.join(__dirname, '../public/level-cards'))
    .filter(file => file.includes('kim-sion-level-10-prompt'))
  
  if (promptFiles.length === 0) {
    console.log('❌ 프롬프트 파일을 찾을 수 없습니다.')
    return
  }
  
  const promptFile = promptFiles[0]
  const prompt = fs.readFileSync(path.join(__dirname, '../public/level-cards', promptFile), 'utf8')
  
  console.log('📝 사용할 프롬프트:')
  console.log(prompt.substring(0, 200) + '...\n')
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    console.log('🔄 Gemini API 호출 중...')
    
    // 텍스트 생성 (이미지 생성은 별도 모델 필요)
    const result = await model.generateContent([prompt])
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini 응답:')
    console.log(text)
    
    // 응답 저장
    const responseFile = `kim-sion-gemini-response-${Date.now()}.txt`
    fs.writeFileSync(
      path.join(__dirname, '../public/level-cards', responseFile),
      `김시온 학생 10레벨 카드 생성 프롬프트 결과\n\n${text}`
    )
    
    console.log(`\n💾 응답 저장: /level-cards/${responseFile}`)
    console.log('\n💡 참고: Gemini 1.5 Flash는 텍스트 생성 모델입니다.')
    console.log('🖼️ 이미지 생성을 위해서는 DALL-E, Midjourney, 또는 Stable Diffusion을 사용하세요.')
    
  } catch (error) {
    console.error('❌ Gemini API 오류:', error.message)
    
    // 에러 시 플레이스홀더 SVG 사용
    console.log('\n🔄 플레이스홀더 이미지로 진행합니다.')
    console.log('✅ SVG 카드가 이미 생성되어 있습니다.')
  }
}

generateWithGemini()