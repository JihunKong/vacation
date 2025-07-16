#!/usr/bin/env node

// Railway 대시보드에서 DATABASE_URL을 복사해서 아래에 붙여넣으세요
const DATABASE_URL = process.env.DATABASE_URL || "여기에_DATABASE_URL을_붙여넣으세요";

if (DATABASE_URL === "여기에_DATABASE_URL을_붙여넣으세요") {
  console.error("❌ DATABASE_URL을 설정해주세요!");
  console.log("\n사용법:");
  console.log("1. Railway 대시보드에서 vacation 프로젝트로 이동");
  console.log("2. PostgreSQL 서비스 클릭");
  console.log("3. Variables 탭에서 DATABASE_URL 복사");
  console.log("4. 이 파일의 DATABASE_URL 변수에 붙여넣기");
  console.log("5. 다시 실행: node scripts/create-tables-direct.js");
  process.exit(1);
}

// 환경변수 설정
process.env.DATABASE_URL = DATABASE_URL;

const { execSync } = require('child_process');

console.log("🚀 데이터베이스 테이블 생성 시작...\n");

try {
  // 1. Prisma 클라이언트 생성
  console.log("1️⃣ Prisma 클라이언트 생성 중...");
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 2. 데이터베이스 스키마 적용
  console.log("\n2️⃣ 데이터베이스 스키마 적용 중...");
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // 3. 테이블 확인
  console.log("\n3️⃣ 생성된 테이블 확인 중...");
  execSync('node scripts/check-tables.js', { stdio: 'inherit' });
  
  console.log("\n✅ 데이터베이스 테이블 생성 완료!");
  console.log("이제 https://vacation-production-f151.up.railway.app 에서 회원가입이 가능합니다.");
  
} catch (error) {
  console.error("\n❌ 오류 발생:", error.message);
  process.exit(1);
}