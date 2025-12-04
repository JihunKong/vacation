const https = require('https')

async function generateKimSionCard() {
  console.log('🎨 김시온 학생 (kimsion70823@gmail.com) 10레벨 카드 생성 시작...\n')
  
  // 김시온 학생의 정확한 정보
  const kimSionEmail = 'kimsion70823@gmail.com'
  const targetLevel = 10
  
  console.log(`👤 대상: ${kimSionEmail}`)
  console.log(`🎯 생성할 레벨: ${targetLevel}`)
  console.log(`🔐 서버 토큰 사용: ${process.env.NEXTAUTH_SECRET ? '설정됨' : '미설정'}`)
  
  const postData = JSON.stringify({
    level: targetLevel,
    userEmail: kimSionEmail,  // 이메일로 사용자 식별
    serverToken: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key-here-change-in-production',
    forceGenerate: true  // 기존 카드가 있어도 새로 생성
  })

  const options = {
    hostname: 'xn--oj4b21j.com',
    port: 443,
    path: '/api/level-image/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0'
    }
  }

  return new Promise((resolve, reject) => {
    console.log('📡 API 요청 전송 중...')
    
    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          console.log(`📊 HTTP Status: ${res.statusCode}`)
          
          if (res.statusCode === 200) {
            const response = JSON.parse(data)
            
            if (response.success) {
              console.log('✅ 카드 생성 성공!')
              console.log(`🖼️ 이미지 URL: ${response.imageUrl}`)
              console.log(`📝 프롬프트: ${response.prompt}`)
              console.log(`🎨 캐릭터 타입: ${response.characterType || '랜덤'}`)
              
              if (response.stats) {
                console.log('📊 사용된 능력치:')
                console.log(`  STR: ${response.stats.strength}`)
                console.log(`  INT: ${response.stats.intelligence}`)
                console.log(`  DEX: ${response.stats.dexterity}`)
                console.log(`  CHA: ${response.stats.charisma}`)
                console.log(`  VIT: ${response.stats.vitality}`)
              }
              
              resolve(response)
            } else {
              console.log('❌ 카드 생성 실패:', response.error)
              resolve(response)
            }
          } else {
            console.log('❌ API 요청 실패')
            console.log('Raw 응답:', data)
            resolve({ success: false, error: `HTTP ${res.statusCode}`, raw: data })
          }
        } catch (error) {
          console.log('📄 JSON 파싱 실패, Raw 응답:', data)
          resolve({ success: false, error: 'JSON 파싱 실패', raw: data })
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ 요청 오류:', error.message)
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

// 실행
generateKimSionCard()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 김시온 학생 카드 생성 완료!')
      console.log('💡 이제 갤러리에서 확인할 수 있습니다.')
    } else {
      console.log('\n💥 카드 생성 실패')
      console.log('🔧 문제 해결이 필요합니다.')
      
      if (result.error) {
        console.log(`⚠️  오류: ${result.error}`)
      }
    }
  })
  .catch(error => {
    console.error('💥 스크립트 실행 오류:', error.message)
    console.log('\n🛠️  문제 해결 방법:')
    console.log('1. 네트워크 연결 확인')
    console.log('2. 서버 상태 확인')
    console.log('3. API 엔드포인트 확인')
  })