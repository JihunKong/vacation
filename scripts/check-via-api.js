const https = require('https')

async function checkUsersViaAPI() {
  console.log('🔍 API를 통해 사용자 데이터 확인 중...\n')
  
  const options = {
    hostname: 'xn--oj4b21j.com',
    port: 443,
    path: '/api/users/all',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json'
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          console.log(`HTTP Status: ${res.statusCode}`)
          
          if (res.statusCode === 404) {
            console.log('❌ /api/users/all 엔드포인트가 존재하지 않습니다.')
            console.log('💡 Admin API를 시도해보겠습니다...')
            resolve(null)
            return
          }
          
          const response = JSON.parse(data)
          
          if (response.users && Array.isArray(response.users)) {
            console.log(`📊 총 ${response.users.length}명의 사용자 발견\n`)
            
            // 김시온 관련 계정 찾기
            const kimSionAccounts = response.users.filter(user => 
              user.name && (
                user.name.includes('시온') || 
                user.name.includes('김시온') ||
                user.name.toLowerCase().includes('sion') ||
                (user.email && user.email.includes('sion'))
              )
            )
            
            if (kimSionAccounts.length > 0) {
              console.log(`🎯 김시온 관련 계정 ${kimSionAccounts.length}개 발견:`)
              kimSionAccounts.forEach((user, index) => {
                console.log(`\n--- 계정 ${index + 1} ---`)
                console.log(`👤 이름: ${user.name}`)
                console.log(`📧 이메일: ${user.email}`)
                if (user.studentProfile) {
                  console.log(`📊 레벨: ${user.studentProfile.level}`)
                  console.log(`⭐ 총 경험치: ${user.studentProfile.totalXP}`)
                }
              })
              resolve(kimSionAccounts)
            } else {
              console.log('❌ 김시온 관련 계정을 찾을 수 없습니다.')
              console.log('\n📋 전체 사용자 목록:')
              response.users.slice(0, 10).forEach(user => {
                console.log(`  - ${user.name} (${user.email})`)
              })
              if (response.users.length > 10) {
                console.log(`  ... 그 외 ${response.users.length - 10}명`)
              }
              resolve([])
            }
          } else {
            console.log('📄 응답 구조가 예상과 다릅니다.')
            console.log('Raw 응답:', data.substring(0, 500) + '...')
            resolve(null)
          }
        } catch (error) {
          console.log('📄 JSON 파싱 실패, Raw 응답:', data.substring(0, 500) + '...')
          resolve(null)
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ 요청 오류:', error.message)
      reject(error)
    })

    req.end()
  })
}

// 실행
checkUsersViaAPI()
  .then(result => {
    if (result === null) {
      console.log('\n💡 다른 방법으로 데이터를 확인해야 합니다.')
    } else if (result && result.length > 0) {
      console.log(`\n✅ ${result.length}개의 김시온 계정을 찾았습니다.`)
    }
  })
  .catch(error => {
    console.error('💥 스크립트 오류:', error.message)
  })