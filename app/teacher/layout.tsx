import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  // 교사 권한 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, schoolId: true }
  })
  
  if (user?.role !== "TEACHER") {
    redirect("/dashboard")
  }
  
  if (!user?.schoolId) {
    // 학교가 설정되지 않은 교사는 학교 설정 페이지로
    redirect("/teacher/setup")
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">교사 대시보드</h1>
            <nav className="flex space-x-4">
              <Link href="/teacher" className="text-gray-700 hover:text-gray-900">
                개요
              </Link>
              <Link href="/teacher/activities" className="text-gray-700 hover:text-gray-900">
                학생 활동
              </Link>
              <Link href="/teacher/students" className="text-gray-700 hover:text-gray-900">
                학생 관리
              </Link>
              <Link href="/teacher/reports" className="text-gray-700 hover:text-gray-900">
                보고서
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                학생 모드
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}