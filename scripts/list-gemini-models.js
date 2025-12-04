const { GoogleGenerativeAI } = require('@google/generative-ai')

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDwvTxA8Byy6XMvKuELCSPgzs1XRNh54fQ'
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    
    console.log('🔍 사용 가능한 Gemini 모델 목록 조회 중...\n')
    
    const models = await genAI.listModels()
    
    console.log(`📋 총 ${models.length}개 모델 발견:\n`)
    
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`)
      if (model.displayName) console.log(`   표시명: ${model.displayName}`)
      if (model.description) console.log(`   설명: ${model.description}`)
      if (model.supportedGenerationMethods) {
        console.log(`   지원 메서드: ${model.supportedGenerationMethods.join(', ')}`)
      }
      console.log()
    })
    
    // 이미지 생성 가능한 모델 찾기
    const imageModels = models.filter(model => 
      model.name.includes('image') || 
      model.description?.toLowerCase().includes('image') ||
      model.displayName?.toLowerCase().includes('image')
    )
    
    if (imageModels.length > 0) {
      console.log('🖼️ 이미지 생성 가능한 모델들:')
      imageModels.forEach(model => {
        console.log(`- ${model.name}`)
        if (model.displayName) console.log(`  (${model.displayName})`)
      })
    } else {
      console.log('❌ 이미지 생성 전용 모델을 찾을 수 없습니다.')
      console.log('💡 일반 Gemini 모델로 텍스트 설명을 생성한 후 다른 이미지 생성 도구를 사용해야 할 수 있습니다.')
    }
    
  } catch (error) {
    console.error('❌ 모델 목록 조회 오류:', error.message)
  }
}

listAvailableModels()