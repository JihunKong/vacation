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
    </div>
  )
}