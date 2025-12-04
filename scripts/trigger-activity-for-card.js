const https = require('https')

// 김시온 학생을 위한 임시 활동 생성 (레벨업 트리거용)
async function triggerActivityForCard() {
  console.log('🎯 김시온 학생 레벨업 트리거를 위한 활동 생성 시도...\n')
  
  const activityData = {
    category: '학습',
    description: '10레벨 카드 생성을 위한 임시 활동',
    duration: 1, // 1분
    date: new Date().toISOString(),
    userEmail: 'kimsion70823@gmail.com', // 이메일로 사용자 식별
    serverToken: 'your-nextauth-secret-key-here-change-in-production'
  }

  const postData = JSON.stringify(activityData)

  const options = {
    hostname: 'xn--oj4b21j.com',
    port: 443,
    path: '/api/activities',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  return new Promise((resolve) => {
    console.log('📡 활동 생성 API 호출 중...')
    
    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        console.log(`📊 HTTP Status: ${res.statusCode}`)
        
        try {
          const response = JSON.parse(data)
          
          if (res.statusCode === 201 && response.success) {
            console.log('✅ 활동 생성 성공!')
            console.log('🎉 레벨업 체크가 트리거되어 카드가 자동 생성될 예정입니다!')
            resolve({ success: true, response })
          } else {
            console.log(`❌ 활동 생성 실패: ${response.error || 'Unknown error'}`)
            resolve({ success: false, error: response.error, data })
          }
        } catch (error) {
          console.log(`📄 Raw 응답: ${data.substring(0, 300)}`)
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

// 실행
triggerActivityForCard()
  .then(result => {
    if (result.success) {
      console.log('\n🎊 성공! 김시온 학생의 활동이 추가되어 레벨업 체크가 실행됩니다.')
      console.log('💡 잠시 후 갤러리에서 10레벨 카드를 확인할 수 있습니다.')
    } else {
      console.log('\n💔 활동 생성 실패')
      console.log('📋 다른 방법으로 카드를 생성해야 합니다.')
      
      if (result.raw && result.raw.includes('Unauthorized')) {
        console.log('🔐 인증 문제로 보입니다. 직접 서버에서 실행이 필요합니다.')
      }
    }
  })
  .catch(error => {
    console.error('💥 스크립트 실행 오류:', error)
  })