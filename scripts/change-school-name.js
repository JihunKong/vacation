#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const SCHOOL_NAME = process.argv[2];
const SCHOOL_SHORT = process.argv[3];

if (!SCHOOL_NAME || !SCHOOL_SHORT) {
  console.log('사용법: node scripts/change-school-name.js "금성고등학교" "금성고"');
  process.exit(1);
}

const filesToUpdate = [
  {
    path: 'app/page.tsx',
    replacements: [
      { from: /완도고등학교.*?여름방학 퀘스트/, to: `${SCHOOL_NAME} 여름방학 퀘스트` }
    ]
  },
  {
    path: 'app/auth/signin/page.tsx',
    replacements: [
      { from: /완도고.*?여름방학 퀘스트/, to: `${SCHOOL_SHORT} 여름방학 퀘스트` }
    ]
  },
  {
    path: 'components/layout/dashboard-nav.tsx',
    replacements: [
      { from: /🏝️.*?여름방학 퀘스트/, to: `🏝️ ${SCHOOL_SHORT} 여름방학 퀘스트` }
    ]
  },
  {
    path: 'CLAUDE.md',
    replacements: [
      { from: /Wando High School/, to: SCHOOL_NAME },
      { from: /완도고/, to: SCHOOL_SHORT }
    ]
  }
];

async function updateFiles() {
  console.log(`🏫 학교명을 '${SCHOOL_NAME}'으로 변경합니다...\n`);

  for (const file of filesToUpdate) {
    try {
      const filePath = path.join(process.cwd(), file.path);
      let content = await fs.readFile(filePath, 'utf8');
      
      for (const replacement of file.replacements) {
        const before = content;
        content = content.replace(replacement.from, replacement.to);
        
        if (before !== content) {
          console.log(`✅ ${file.path}: 변경됨`);
        }
      }
      
      await fs.writeFile(filePath, content);
    } catch (error) {
      console.error(`❌ ${file.path}: 오류 발생 - ${error.message}`);
    }
  }
  
  console.log('\n✨ 학교명 변경 완료!');
  console.log('\n다음 단계:');
  console.log('1. git add -A');
  console.log('2. git commit -m "Change school name to ' + SCHOOL_NAME + '"');
  console.log('3. git push origin main');
}

updateFiles().catch(console.error);