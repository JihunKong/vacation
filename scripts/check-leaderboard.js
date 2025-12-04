const https = require('https')

async function checkLeaderboard() {
  console.log('🏆 리더보드를 통해 김시온 학생 확인 중...\n')
  
  const options = {
    hostname: 'xn--oj4b21j.com',
    port: 443,
    path: '/api/leaderboard',
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
          
          if (res.statusCode !== 200) {
            console.log('❌ 리더보드 API 접근 실패')
            console.log('Raw 응답:', data)
            resolve(null)
            return
          }
          
          const response = JSON.parse(data)
          
          if (response.students && Array.isArray(response.students)) {
            console.log(`📊 리더보드에 ${response.students.length}명의 학생 발견\n`)
            
            // 김시온 관련 계정 찾기
            const kimSionAccounts = response.students.filter(student => 
              student.name && (
                student.name.includes('시온') || 
                student.name.includes('김시온') ||
                student.name.toLowerCase().includes('sion')
              )
            )
            
            if (kimSionAccounts.length > 0) {
              console.log(`🎯 김시온 관련 계정 ${kimSionAccounts.length}개 발견:`)
              kimSionAccounts.forEach((student, index) => {
                console.log(`\n--- 계정 ${index + 1} ---`)
                console.log(`👤 이름: ${student.name}`)
                console.log(`🏫 학교: ${student.school || '없음'}`)
                console.log(`📊 레벨: ${student.level}`)
                console.log(`⭐ 총 경험치: ${student.totalXP}`)
                console.log(`⏰ 총 학습시간: ${Math.floor(student.totalMinutes / 60)}시간`)
                console.log(`🏆 순위: ${student.rank}`)
              })
              
              // 가장 경험치가 높은 계정 찾기
              const topAccount = kimSionAccounts.sort((a, b) => b.totalXP - a.totalXP)[0]
              console.log(`\n🥇 가장 활동이 많은 김시온 계정: ${topAccount.name} (${topAccount.totalXP} XP)`)
              
              resolve(kimSionAccounts)
            } else {
              console.log('❌ 김시온 관련 계정을 찾을 수 없습니다.')
              console.log('\n📋 리더보드 TOP 10:')
              response.students.slice(0, 10).forEach((student, index) => {
                console.log(`  ${index + 1}. ${student.name} (${student.school || 'N/A'}) - ${student.totalXP} XP`)
              })
              resolve([])
            }
          } else {
            console.log('📄 응답 구조가 예상과 다릅니다.')
            console.log('Raw 응답:', JSON.stringify(response, null, 2))
            resolve(null)
          }
        } catch (error) {
          console.log('📄 JSON 파싱 실패, Raw 응답:', data)
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
checkLeaderboard()
  .then(result => {
    if (result && result.length > 0) {
      console.log(`\n✅ ${result.length}개의 김시온 계정을 찾았습니다.`)
      console.log('💡 이제 이 정보를 바탕으로 능력치 수정과 카드 생성을 진행할 수 있습니다.')
    } else {
      console.log('\n❌ 김시온 계정 확인 실패')
    }
  })
  .catch(error => {
    console.error('💥 스크립트 오류:', error.message)
  })