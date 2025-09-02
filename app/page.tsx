import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex-1 flex flex-col items-center justify-center p-24">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-5xl font-bold">
            🌱 성장닷컴
          </h1>
          <p className="text-xl text-gray-700">
            매일의 학습을 게임처럼 즐기며 성장하세요!
          </p>
          <p className="text-lg text-gray-600">
            매일의 활동을 기록하고, 경험치를 획득하며, 나만의 아바타를 성장시켜보세요.
          </p>
          <div className="pt-8">
            <Button asChild size="lg">
              <Link href="/auth/signin">
                시작하기
              </Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 pt-4">
            ※ 모든 학생들이 이용 가능합니다
          </p>
        </div>
      </main>
      
      <footer className="w-full border-t bg-white/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              © 2025 성장닷컴. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 hover:underline">
                서비스 이용약관
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 hover:underline">
                개인정보처리방침
              </Link>
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900 hover:underline">
                갤러리
              </Link>
              <a href="mailto:purusil55@gmail.com" className="text-gray-600 hover:text-gray-900 hover:underline">
                문의하기
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}