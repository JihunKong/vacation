# 🎯 Fork 없이 금성고 버전 만들기

## 방법 1: 직접 복사 (권장)

### 1단계: GitHub에서 새 리포지토리 생성
1. GitHub.com 로그인
2. 우측 상단 **+** → **New repository**
3. Repository name: `geumseong-vacation`
4. **Create repository** (README 추가하지 않음)

### 2단계: 로컬에서 코드 복사
```bash
# 현재 프로젝트를 새 폴더로 복사
cd ..
cp -r vacation geumseong-vacation
cd geumseong-vacation

# Git 초기화
rm -rf .git
git init

# 새 리포지토리 연결
git remote add origin https://github.com/JihunKong/geumseong-vacation.git

# 학교명 변경
node scripts/change-school-name.js "금성고등학교" "금성고"

# 첫 커밋
git add -A
git commit -m "Initial commit - 금성고등학교 여름방학 퀘스트"
git branch -M main
git push -u origin main
```

## 방법 2: GitHub Template 사용

### 현재 리포지토리를 Template으로 설정
1. https://github.com/JihunKong/vacation/settings
2. **Template repository** 체크박스 선택
3. 저장

### Template에서 새 리포지토리 생성
1. https://github.com/JihunKong/vacation
2. **Use this template** 버튼 클릭
3. Repository name: `geumseong-vacation`
4. **Create repository from template**

## 방법 3: 한 줄 명령어로 복사

```bash
# 전체 과정을 한 번에 실행
bash -c "cd .. && cp -r vacation geumseong-vacation && cd geumseong-vacation && rm -rf .git && git init && node scripts/change-school-name.js '금성고등학교' '금성고' && git add -A && git commit -m 'Initial commit - 금성고등학교' && echo '✅ 완료! 이제 GitHub에 push하세요'"
```

그 다음:
```bash
git remote add origin https://github.com/JihunKong/geumseong-vacation.git
git push -u origin main
```

---

## 🚀 Railway 배포는 동일합니다

1. Railway.app → New Project
2. Deploy from GitHub repo
3. `geumseong-vacation` 선택
4. PostgreSQL 추가
5. 환경변수 설정
6. 데이터베이스 초기화

자세한 내용은 `GEUMSEONG_DEPLOYMENT_GUIDE.md` 참조