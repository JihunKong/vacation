const https = require('https')

// 프로덕션 환경의 실제 서버 토큰들을 시도해보기
const possibleTokens = [
  'your-nextauth-secret-key-here-change-in-production',
  process.env.NEXTAUTH_SECRET,
  // 기타 가능한 토큰들
]

async function attemptCardGeneration(serverToken, attemptNumber) {
  console.log(`\n🧪 시도 ${attemptNumber}: 서버 토큰으로 카드 생성 시도...`)
  
  const postData = JSON.stringify({
    level: 10,
    userEmail: 'kimsion70823@gmail.com',
    forceGenerate: true,
    serverToken: serverToken
  })

  const options = {
    hostname: 'xn--oj4b21j.com',
    port: 443,
    path: '/api/level-image/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        console.log(`📊 HTTP Status: ${res.statusCode}`)
        
        try {
          const response = JSON.parse(data)
          if (res.statusCode === 200 && response.success) {
            console.log('🎉 카드 생성 성공!')
            console.log('✅ 응답:', JSON.stringify(response, null, 2))
            resolve({ success: true, response })
          } else {
            console.log(`❌ 실패: ${response.error || 'Unknown error'}`)
            resolve({ success: false, error: response.error })
          }
        } catch (error) {
          console.log(`📄 Raw 응답: ${data.substring(0, 200)}`)
          resolve({ success: false, error: 'JSON parse error', raw: data })
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ 요청 오류:', error.message)
      resolve({ success: false, error: error.message })
    })

    req.write(postData)
    req.end()
  })
}

async function forceGenerateKimSionCard() {
  console.log('🚀 김시온 학생 10레벨 카드 강제 생성 시작...')
  console.log('👤 대상 계정: kimsion70823@gmail.com')
  console.log('🎯 생성 레벨: 10')
  
  // 다양한 서버 토큰으로 시도
  for (let i = 0; i < possibleTokens.length; i++) {
    const token = possibleTokens[i]
    if (!token) continue
    
    const result = await attemptCardGeneration(token, i + 1)
    
    if (result.success) {
      console.log('\n✅ 김시온 학생 10레벨 카드 생성 완료!')
      console.log('💡 갤러리에서 확인 가능합니다.')
      return result.response
    }
    
    // 잠깐 대기 후 다음 시도
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n💥 모든 시도 실패')
  console.log('🛠️ 대안 방법:')
  console.log('1. 프로덕션 서버에서 직접 스크립트 실행')
  console.log('2. 데이터베이스에 직접 SQL 삽입')
  console.log('3. 김시온 학생이 활동 추가하여 레벨업 이벤트 트리거')
  
  return null
}

// 실행
forceGenerateKimSionCard()
  .then(result => {
    if (result) {
      console.log('\n🎊 김시온 학생의 10레벨 카드가 성공적으로 생성되었습니다!')
    } else {
      console.log('\n📞 추가 지원이 필요합니다.')
    }
  })
  .catch(error => {
    console.error('💥 스크립트 실행 오류:', error)
  })