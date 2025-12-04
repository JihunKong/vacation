const https = require('https')

// 두 가지 방법으로 API 테스트
async function testAPI(method, data, description) {
  console.log(`🧪 테스트: ${description}`)
  
  const postData = JSON.stringify(data)

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
          console.log(`✅ 응답:`, JSON.stringify(response, null, 2))
        } catch (error) {
          console.log(`📄 Raw 응답: ${data.substring(0, 200)}...`)
        }
        
        resolve({ status: res.statusCode, data })
      })
    })

    req.on('error', (error) => {
      console.error('❌ 요청 오류:', error.message)
      resolve({ error: error.message })
    })

    req.write(postData)
    req.end()
  })
}

async function runTests() {
  console.log('🔧 김시온 카드 생성 API 테스트 시작\n')
  
  // 테스트 1: 기존 방식 (studentId 방식)
  await testAPI('POST', {
    level: 10,
    studentId: 'dummy-student-id',  // 실제로는 존재하지 않는 ID
    serverToken: 'your-nextauth-secret-key-here-change-in-production'
  }, '기존 studentId 방식')
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 테스트 2: 새로운 방식 (userEmail 방식) - 업데이트된 API가 배포되었다면 작동할 것
  await testAPI('POST', {
    level: 10,
    userEmail: 'kimsion70823@gmail.com',
    forceGenerate: true,
    serverToken: 'your-nextauth-secret-key-here-change-in-production'
  }, '새로운 userEmail 방식')
  
  console.log('\n🎯 테스트 완료. 위 결과를 바탕으로 API 상태를 확인할 수 있습니다.')
}

runTests().catch(console.error)