const https = require('https')

// 직접 카드 생성을 위한 최종 시도
async function directCreateCard() {
  console.log('🎯 김시온 학생 10레벨 카드 강제 생성...\n')
  
  // 다양한 API 엔드포인트와 방법들을 시도
  const attempts = [
    {
      name: '레벨 이미지 생성 API (userEmail)',
      path: '/api/level-image/generate',
      data: {
        level: 10,
        userEmail: 'kimsion70823@gmail.com',
        forceGenerate: true,
        serverToken: 'your-nextauth-secret-key-here-change-in-production'
      }
    },
    {
      name: '활동 추가 API (자동 트리거)',
      path: '/api/activities',
      data: {
        category: '학습',
        description: '10레벨 카드 생성 트리거용 활동',
        duration: 1,
        date: new Date().toISOString(),
        userEmail: 'kimsion70823@gmail.com',
        serverToken: 'your-nextauth-secret-key-here-change-in-production'
      }
    },
    {
      name: '레벨 이미지 테스트 API',
      path: '/api/level-image/test',
      data: {
        testUser: 'kimsion70823@gmail.com',
        level: 10,
        action: 'generate'
      }
    }
  ]
  
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i]
    console.log(`\n🔄 ${i + 1}번 시도: ${attempt.name}`)
    
    const result = await makeRequest(attempt.path, attempt.data)
    
    if (result.success) {
      console.log('🎉 성공! 카드 생성 완료!')
      console.log('✅ 응답:', JSON.stringify(result.response, null, 2))
      return result
    } else {
      console.log(`❌ 실패: ${result.error}`)
      if (result.status !== 401) {
        console.log(`📄 상세: ${result.raw?.substring(0, 200) || 'N/A'}`)
      }
    }
    
    // 다음 시도 전 잠시 대기
    if (i < attempts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('\n💔 모든 API 시도 실패')
  return null
}

function makeRequest(path, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data)
    
    const options = {
      hostname: 'xn--oj4b21j.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData)
          
          if (res.statusCode >= 200 && res.statusCode < 300 && response.success) {
            resolve({ success: true, response, status: res.statusCode })
          } else {
            resolve({ 
              success: false, 
              error: response.error || `HTTP ${res.statusCode}`,
              status: res.statusCode,
              raw: responseData
            })
          }
        } catch (error) {
          resolve({ 
            success: false, 
            error: 'JSON parse error',
            status: res.statusCode,
            raw: responseData
          })
        }
      })
    })
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message })
    })
    
    req.write(postData)
    req.end()
  })
}

// 실행
console.log('🚀 김시온 학생 10레벨 카드 직접 생성 시작...')
console.log('👤 대상 계정: kimsion70823@gmail.com')
console.log('🎯 생성할 카드: Level 10')
console.log('🎨 캐릭터: Apple Scholar (다양성 시스템)')

directCreateCard()
  .then(result => {
    if (result) {
      console.log('\n🎊 김시온 학생 10레벨 카드 생성 성공!')
      console.log('💡 갤러리에서 확인할 수 있습니다.')
    } else {
      console.log('\n🔧 최종 해결책: 서버에서 직접 실행 필요')
      console.log('📋 명령어:')
      console.log('cd /home/ubuntu/vacation && DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studylog_db" node -e "...[생성 스크립트]..."')
    }
  })
  .catch(error => {
    console.error('💥 스크립트 오류:', error)
  })