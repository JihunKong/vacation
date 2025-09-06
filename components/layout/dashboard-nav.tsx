"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Home, 
  Calendar, 
  Trophy, 
  BarChart, 
  LogOut,
  Settings,
  Users,
  Clock,
  Image,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "홈", icon: Home },
    { href: "/dashboard/timer", label: "타이머", icon: Clock },
    { href: "/dashboard/plan", label: "일일 계획", icon: Calendar },
    { href: "/dashboard/activities", label: "활동 기록", icon: Trophy },
    { href: "/dashboard/stats", label: "통계", icon: BarChart },
    { href: "/dashboard/leaderboard", label: "리더보드", icon: Users },
    { href: "/dashboard/gallery", label: "갤러리", icon: Image },
  ]

  // 교사 메뉴 추가
  if (user.role === "TEACHER" || user.role === "ADMIN") {
    navItems.push({ href: "/teacher", label: "교사 관리", icon: Settings })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* 모바일 메뉴 버튼 */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>🌱 성장닷컴</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
                
                <div className="mt-8 pt-4 border-t">
                  <div className="mb-4 px-3 text-sm text-gray-600">
                    {user.name || user.email}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3"
                    onClick={() => {
                      setIsOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    로그아웃
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href="/dashboard" className="text-xl font-bold">
            🌱 성장닷컴
          </Link>
          
          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 데스크톱 사용자 정보 */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {user.name || user.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 모바일 사용자 정보 (간소화) */}
        <div className="md:hidden flex items-center gap-2">
          <div className="text-sm text-gray-600 truncate max-w-[150px]">
            {user.name || user.email}
          </div>
        </div>
      </div>
    </header>
  )
}