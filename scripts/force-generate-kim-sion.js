const https = require('https');

async function forceGenerateKimSionCard() {
  console.log('🎯 김시온 학생 카드 강제 생성 시작...\n');

  const postData = JSON.stringify({
    level: 10,
    studentId: "cm1rfbubr0000dz8rnkzxedkl", // 김시온 학생 ID (예상)
    serverToken: process.env.NEXTAUTH_SECRET
  });

  const options = {
    hostname: 'xn--oj4b21j.com',
    port: 443,
    path: '/api/level-image/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ API 응답:', response);
          resolve(response);
        } catch (error) {
          console.log('📄 Raw 응답:', data);
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 요청 오류:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 실행
forceGenerateKimSionCard()
  .then(result => {
    console.log('\n🎉 카드 생성 완료!');
    if (result.success) {
      console.log('🖼️ 이미지 URL:', result.imageUrl);
      console.log('📝 프롬프트:', result.prompt);
    }
  })
  .catch(error => {
    console.error('💥 오류 발생:', error);
  });