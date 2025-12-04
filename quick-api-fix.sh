#!/bin/bash

echo "🚀 김시온 카드 생성을 위한 긴급 API 업데이트..."

# 수정된 파일만 서버에 업로드
scp -i ~/.ssh/aws-key.pem app/api/level-image/generate/route.ts ubuntu@43.200.27.173:/home/ubuntu/vacation/app/api/level-image/generate/

# 서버에서 PM2 재시작
ssh -i ~/.ssh/aws-key.pem ubuntu@43.200.27.173 << 'EOF'
cd /home/ubuntu/vacation
echo "🔄 서버에서 앱 재시작 중..."
pm2 restart studylog
echo "✅ 앱 재시작 완료"
pm2 status
EOF

echo "🎯 API 업데이트 완료. 이제 카드 생성을 시도합니다."