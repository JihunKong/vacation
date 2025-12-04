#!/usr/bin/env node
/**
 * 레벨 카드 이미지 초기화 스크립트
 * Railway Volume이 비어있을 때 backup에서 복사
 */

const fs = require('fs');
const path = require('path');

const volumePath = path.join(process.cwd(), 'public', 'level-cards');
const backupPath = path.join(process.cwd(), 'public', 'level-cards-backup');

console.log('🎴 Initializing level-cards volume...');
console.log(`Volume path: ${volumePath}`);
console.log(`Backup path: ${backupPath}`);

// 볼륨 디렉토리 확인/생성
if (!fs.existsSync(volumePath)) {
  fs.mkdirSync(volumePath, { recursive: true });
  console.log('Created volume directory');
}

// backup 디렉토리 확인
if (!fs.existsSync(backupPath)) {
  console.log('No backup directory found, skipping initialization');
  process.exit(0);
}

// 볼륨 내 파일 개수 확인
const existingFiles = fs.readdirSync(volumePath).filter(f => f.endsWith('.png') || f.endsWith('.svg'));
const backupFiles = fs.readdirSync(backupPath).filter(f => f.endsWith('.png') || f.endsWith('.svg'));

console.log(`Existing files in volume: ${existingFiles.length}`);
console.log(`Files in backup: ${backupFiles.length}`);

// 볼륨이 비어있거나 파일이 적으면 backup에서 복사
if (existingFiles.length < backupFiles.length) {
  console.log('Copying files from backup to volume...');

  let copied = 0;
  for (const file of backupFiles) {
    const srcPath = path.join(backupPath, file);
    const destPath = path.join(volumePath, file);

    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      copied++;
      console.log(`  Copied: ${file}`);
    }
  }

  console.log(`✅ Copied ${copied} files to volume`);
} else {
  console.log('✅ Volume already initialized');
}
