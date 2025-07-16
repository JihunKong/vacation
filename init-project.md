# 01. 프로젝트 초기화

## 1. Next.js 프로젝트 생성

```bash
# 프로젝트 생성
npx create-next-app@latest summer-quest --typescript --tailwind --app --src-dir=false

# 프로젝트 디렉토리로 이동
cd summer-quest
```

생성 시 선택 옵션:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: @/*

## 2. 필수 패키지 설치

```bash
# 인증 관련
npm install next-auth @auth/prisma-adapter

# 데이터베이스
npm install @prisma/client prisma

# UI 라이브러리
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-progress

# 애니메이션
npm install framer-motion

# 유틸리티
npm install clsx tailwind-merge class-variance-authority
npm install date-fns axios
npm install lucide-react

# 차트
npm install recharts

# AI
npm install openai

# 개발 도구
npm install -D @types/node
```

## 3. shadcn/ui 초기화

```bash
npx shadcn-ui@latest init
```

설정 옵션:
- Style: Default
- Base color: Zinc
- CSS variables: Yes

## 4. 기본 디렉토리 구조 생성

```bash
# 디렉토리 생성
mkdir -p app/{api,\(auth\),\(main\),\(teacher\)}
mkdir -p app/api/{auth,plans,stats,ai}
mkdir -p app/\(auth\)/{login,register}
mkdir -p app/\(main\)/{dashboard,planner,leaderboard,profile}
mkdir -p app/\(teacher\)/{overview,students,export}
mkdir -p components/{ui,layout,features}
mkdir -p lib/{db,utils,constants}
mkdir -p prisma
mkdir -p public/{images,gifs}
mkdir -p styles
```

## 5. 환경 변수 파일 생성

`.env.local` 파일 생성:

```bash
# Database
DATABASE_URL=""

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OpenAI
OPENAI_API_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`.env.example` 파일도 동일하게 생성 (값은 비워둠)

## 6. TypeScript 설정 업데이트

`tsconfig.json` 수정:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 7. Tailwind CSS 설정

`tailwind.config.ts` 수정:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

## 8. Git 설정

`.gitignore` 확인 및 추가:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
prisma/*.db
prisma/*.db-journal
```

## 9. 초기 커밋

```bash
git init
git add .
git commit -m "Initial commit: Next.js project setup with dependencies"
```

## 다음 단계
프로젝트 초기화가 완료되었습니다. 다음은 `02-database-setup.md`를 참고하여 데이터베이스를 설정하세요.