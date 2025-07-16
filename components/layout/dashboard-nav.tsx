"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Calendar, 
  Trophy, 
  BarChart, 
  LogOut,
  Settings,
  Users
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

  const navItems = [
    { href: "/dashboard", label: "홈", icon: Home },
    { href: "/dashboard/plan", label: "일일 계획", icon: Calendar },
    { href: "/dashboard/activities", label: "활동 기록", icon: Trophy },
    { href: "/dashboard/stats", label: "통계", icon: BarChart },
    { href: "/dashboard/leaderboard", label: "리더보드", icon: Users },
  ]

  // 교사 메뉴 추가
  if (user.role === "TEACHER" || user.role === "ADMIN") {
    navItems.push({ href: "/teacher", label: "교사 관리", icon: Settings })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            🏝️ 여름방학 퀘스트
          </Link>
          
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

        <div className="flex items-center gap-4">
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
      </div>
    </header>
  )
}