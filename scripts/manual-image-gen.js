// 수동으로 10레벨 이미지 생성을 위한 스크립트

async function generateLevelImage() {
  try {
    // 프로덕션 서버에 직접 요청
    const response = await fetch('https://xn--oj4b21j.com/api/level-image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 세션 쿠키 필요 - 브라우저에서 실행해야 함
      },
      body: JSON.stringify({
        level: 10
      })
    })

    const result = await response.json()
    console.log('Response:', result)
  } catch (error) {
    console.error('Error:', error)
  }
}

// 브라우저 콘솔에서 실행할 코드
const browserCode = `
// 브라우저 콘솔에서 실행하세요 (로그인 후)
fetch('/api/level-image/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    level: 10,
    regenerate: true
  })
})
.then(res => res.json())
.then(console.log)
.catch(console.error)
`

console.log('브라우저 콘솔에서 다음 코드를 실행하세요:')
console.log(browserCode)