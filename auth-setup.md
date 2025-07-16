# 03. 인증 설정 (NextAuth + Google OAuth)

## 1. Google Cloud Console 설정

### OAuth 2.0 클라이언트 ID 생성
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: 웹 애플리케이션
6. 이름: "Summer Quest"
7. 승인된 JavaScript 원본:
   - `http://localhost:3000` (개발)
   - `https://your-domain.com` (프로덕션)
8. 승인된 리디렉션 URI:
   - `http://localhost:3000/api/auth/callback/google` (개발)
   - `https://your-domain.com/api/auth/callback/google` (프로덕션)
9. 생성 후 클라이언트 ID와 클라이언트 시크릿 복사

### 환경 변수 설정
`.env.local` 파일 업데이트:
```
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## 2. NextAuth Secret 생성

```bash
# OpenSSL로 시크릿 생성
openssl rand -base64 32
```

`.env.local`에 추가:
```
NEXTAUTH_SECRET="생성된-시크릿-키"
```

## 3. NextAuth 설정 파일 작성

`lib/auth/auth-options.ts` 파일 생성:

```typescript
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import { Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 이메일 도메인 확인 (선택사항)
      if (user.email?.endsWith('@wando.hs.kr')) {
        // 완도고 이메일인 경우 자동 승인
        return true
      }
      // 다른 이메일도 허용
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        
        // DB에서 추가 정보 가져오기
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            nickname: true,
            level: true,
            totalExp: true,
            classId: true
          }
        })
        
        if (dbUser) {
          session.user.role = dbUser.role
          session.user.nickname = dbUser.nickname
          session.user.level = dbUser.level
          session.user.totalExp = dbUser.totalExp
          session.user.classId = dbUser.classId
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 로그인 후 리다이렉트 처리
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/dashboard"
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
    newUser: '/register'
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  debug: process.env.NODE_ENV === 'development',
}
```

## 4. NextAuth Route Handler 생성

`app/api/auth/[...nextauth]/route.ts` 파일 생성:

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

## 5. 타입 정의 확장

`types/next-auth.d.ts` 파일 생성:

```typescript
import { Role } from "@prisma/client"
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      nickname?: string | null
      level: number
      totalExp: number
      classId?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    nickname?: string | null
    level: number
    totalExp: number
    classId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}
```

## 6. 인증 유틸리티 함수

`lib/auth/auth-utils.ts` 파일 생성:

```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth-options"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }
  
  return user
}

export async function requireRole(role: Role) {
  const user = await requireAuth()
  
  if (user.role !== role && user.role !== Role.ADMIN) {
    redirect("/unauthorized")
  }
  
  return user
}

export async function requireTeacher() {
  return requireRole(Role.TEACHER)
}
```

## 7. 인증 Provider 컴포넌트

`components/providers/auth-provider.tsx` 파일 생성:

```typescript
"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={0}>
      {children}
    </SessionProvider>
  )
}
```

## 8. Root Layout 업데이트

`app/layout.tsx` 수정:

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "여름방학 성장 퀘스트",
  description: "완도고등학교 학생들을 위한 방학 계획 관리 시스템",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
```

## 9. 로그인 페이지 생성

`app/(auth)/login/page.tsx` 파일 생성:

```typescript
"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import Image from "next/image"

export default function LoginPage() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/images/logo.png"
              alt="Summer Quest"
              width={80}
              height={80}
              className="rounded-full"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold">여름방학 성장 퀘스트</CardTitle>
          <CardDescription>
            완도고등학교 2학년 여러분, 환영합니다! 🎯
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-12 text-base"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Google 계정으로 시작하기
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>7월 21일 ~ 8월 17일</p>
            <p>함께 성장하는 여름방학을 만들어요!</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="text-center">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-xs">학습</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💪</div>
              <div className="text-xs">운동</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎨</div>
              <div className="text-xs">취미</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 10. 회원가입 후 닉네임 설정 페이지

`app/(auth)/register/page.tsx` 파일 생성:

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [nickname, setNickname] = useState("")
  const [classId, setClassId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      toast({
        title: "닉네임을 입력해주세요",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, classId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "프로필 설정 실패")
      }

      await update() // 세션 업데이트
      toast({
        title: "환영합니다!",
        description: "프로필 설정이 완료되었습니다."
      })
      
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: error instanceof Error ? error.message : "다시 시도해주세요",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
          <CardDescription>
            여름방학 성장 퀘스트에서 사용할 정보를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                placeholder="리더보드에 표시될 닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                다른 학생들에게 보여질 이름입니다
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">학급 (선택)</Label>
              <Input
                id="classId"
                placeholder="예: 2-3"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                학급별 통계를 확인할 수 있습니다
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "설정 중..." : "시작하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 11. 프로필 완성 API 엔드포인트

`app/api/auth/complete-profile/route.ts` 파일 생성:

```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "인증이 필요합니다" },
        { status: 401 }
      )
    }

    const { nickname, classId } = await req.json()

    // 닉네임 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { nickname }
    })

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { message: "이미 사용 중인 닉네임입니다" },
        { status: 400 }
      )
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nickname,
        classId: classId || null
      }
    })

    // UserStats 생성
    await prisma.userStats.create({
      data: { userId: session.user.id }
    }).catch(() => {
      // 이미 존재하는 경우 무시
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { message: "프로필 업데이트 실패" },
      { status: 500 }
    )
  }
}
```

## 12. 미들웨어 설정

`middleware.ts` 파일 생성:

```typescript
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // 교사 전용 페이지 보호
    if (pathname.startsWith("/teacher") && token?.role !== "TEACHER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // 닉네임 미설정 시 등록 페이지로
    if (!pathname.startsWith("/register") && !pathname.startsWith("/api") && !token?.nickname) {
      return NextResponse.redirect(new URL("/register", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/planner/:path*", 
    "/leaderboard/:path*",
    "/profile/:path*",
    "/teacher/:path*"
  ]
}
```

## 다음 단계
인증 설정이 완료되었습니다. 다음은 `04-ui-setup.md`를 참고하여 기본 UI를 구축하세요.