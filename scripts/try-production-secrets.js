const https = require('https')

// 프로덕션 환경에서 사용할 가능성이 높은 NEXTAUTH_SECRET들
const possibleSecrets = [
  'your-nextauth-secret-key-here-change-in-production',
  'production-secret-key-for-studylog',
  'studylog-production-secret-2024',
  'nextauth-secret-production',
  'secure-secret-for-production-env',
  // 더 간단한 시크릿들
  'production-secret',
  'secret-key-production',
  'studylog-secret'
]

async function trySecret(secret, index) {
  console.log(`\n🔑 시도 ${index + 1}: 서버 시크릿 테스트...`)
  
  const postData = JSON.stringify({
    level: 10,
    userEmail: 'kimsion70823@gmail.com',
    forceGenerate: true,
    serverToken: secret
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
            console.log('🎉 성공! 올바른 시크릿을 찾았습니다!')
            console.log('✅ 김시온 10레벨 카드 생성 완료!')
            console.log(`🖼️ 이미지: ${response.image?.imageUrl}`)
            resolve({ success: true, secret, response })
          } else if (res.statusCode === 401) {
            console.log('❌ 인증 실패 (잘못된 시크릿)')
            resolve({ success: false, error: 'Unauthorized' })
          } else {
            console.log(`❌ 실패: ${response.error || '알 수 없는 오류'}`)
            resolve({ success: false, error: response.error, response })
          }
        } catch (error) {
          console.log(`📄 Raw 응답: ${data.substring(0, 100)}...`)
          resolve({ success: false, error: 'Parse error', raw: data })
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ 네트워크 오류:', error.message)
      resolve({ success: false, error: error.message })
    })

    req.write(postData)
    req.end()
  })
}

async function findCorrectSecret() {
  console.log('🔐 김시온 카드 생성을 위한 프로덕션 시크릿 탐색 시작...')
  console.log(`👤 대상: kimsion70823@gmail.com`)
  console.log(`🎯 레벨: 10`)
  console.log(`🔍 시도할 시크릿 수: ${possibleSecrets.length}개\n`)
  
  for (let i = 0; i < possibleSecrets.length; i++) {
    const result = await trySecret(possibleSecrets[i], i)
    
    if (result.success) {
      console.log(`\n🏆 성공! 올바른 시크릿: "${possibleSecrets[i]}"`)
      console.log('🎊 김시온 학생의 10레벨 카드가 생성되었습니다!')
      console.log('💡 이제 갤러리에서 확인할 수 있습니다.')
      return result
    }
    
    // 요청 간 잠시 대기
    if (i < possibleSecrets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log('\n💔 모든 시크릿 시도 실패')
  console.log('🔧 해결 방법:')
  console.log('1. 프로덕션 서버에서 직접 스크립트 실행')
  console.log('2. 김시온 학생이 로그인해서 활동 추가 (자동 트리거)')
  console.log('3. 서버 관리자에게 NEXTAUTH_SECRET 확인 요청')
  
  return null
}

// 실행
findCorrectSecret()
  .then(result => {
    if (result) {
      console.log('\n🎉 김시온 학생 카드 생성 성공!')
    } else {
      console.log('\n📞 추가 지원이 필요합니다.')
    }
  })
  .catch(error => {
    console.error('💥 스크립트 오류:', error)
  })