# 04. UI 설정 및 기본 컴포넌트

## 1. shadcn/ui 컴포넌트 설치

```bash
# 필수 UI 컴포넌트 설치
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add skeleton
```

## 2. 글로벌 스타일 설정

`app/globals.css` 업데이트:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* 커스텀 애니메이션 */
@keyframes levelUp {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.level-up-animation {
  animation: levelUp 0.6s ease-out;
}

/* 카테고리별 색상 */
.category-study { @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200; }
.category-exercise { @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200; }
.category-reading { @apply bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200; }
.category-volunteer { @apply bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200; }
.category-hobby { @apply bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200; }
.category-social { @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200; }
```

## 3. 레이아웃 컴포넌트

`components/layout/main-layout.tsx` 파일 생성:

```typescript
"use client"

import { ReactNode } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Home, 
  Calendar, 
  Trophy, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "대시보드", href: "/dashboard", icon: Home },
    { name: "플래너", href: "/planner", icon: Calendar },
    { name: "리더보드", href: "/leaderboard", icon: Trophy },
    { name: "프로필", href: "/profile", icon: User },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <span className="font-bold text-lg hidden sm:block">
                  여름방학 성장 퀘스트
                </span>
              </Link>
            </div>

            {/* 데스크탑 네비게이션 */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium
                      transition-colors duration-200
                      ${isActive 
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* 사용자 메뉴 */}
            <div className="flex items-center space-x-4">
              {/* 레벨 표시 */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300">Lv.</span>
                <span className="font-bold text-primary">{session?.user?.level || 1}</span>
              </div>

              {/* 프로필 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback>
                        {session?.user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.nickname || session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    프로필
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 모바일 메뉴 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-base font-medium
                      ${isActive 
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
```

## 4. 카테고리 컴포넌트

`components/ui/category-badge.tsx` 파일 생성:

```typescript
import { Badge } from "@/components/ui/badge"
import { Category } from "@prisma/client"

interface CategoryBadgeProps {
  category: Category
  size?: "sm" | "md" | "lg"
}

const categoryConfig = {
  STUDY: { label: "학습", emoji: "📚", className: "category-study" },
  EXERCISE: { label: "운동", emoji: "💪", className: "category-exercise" },
  READING: { label: "독서", emoji: "📖", className: "category-reading" },
  VOLUNTEER: { label: "봉사", emoji: "🤝", className: "category-volunteer" },
  HOBBY: { label: "취미", emoji: "🎨", className: "category-hobby" },
  SOCIAL: { label: "사회활동", emoji: "👥", className: "category-social" },
}

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const config = categoryConfig[category]
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1"
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${config.className} ${sizeClasses[size]} font-medium`}
    >
      <span className="mr-1">{config.emoji}</span>
      {config.label}
    </Badge>
  )
}
```

## 5. 경험치 프로그레스 바

`components/ui/exp-progress.tsx` 파일 생성:

```typescript
"use client"

import { Progress } from "@/components/ui/progress"
import { calculateLevel, expToNextLevel } from "@/lib/db/queries"

interface ExpProgressProps {
  totalExp: number
  showLabel?: boolean
  className?: string
}

export function ExpProgress({ totalExp, showLabel = true, className }: ExpProgressProps) {
  const currentLevel = calculateLevel(totalExp)
  const currentLevelExp = Math.pow(currentLevel - 1, 2) * 100
  const nextLevelExp = Math.pow(currentLevel, 2) * 100
  const progressExp = totalExp - currentLevelExp
  const requiredExp = nextLevelExp - currentLevelExp
  const percentage = (progressExp / requiredExp) * 100

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">경험치</span>
          <span className="font-medium">
            {progressExp} / {requiredExp} XP
          </span>
        </div>
      )}
      <Progress value={percentage} className="h-2" />
    </div>
  )
}
```

## 6. 로딩 스켈레톤

`components/ui/loading-skeleton.tsx` 파일 생성:

```typescript
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 통계 카드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 차트 스켈레톤 */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export function PlannerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-7 gap-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
        