import { Metadata } from 'next'
import Link from 'next/link'
import GalleryClient from '@/components/features/GalleryClient'

export const metadata: Metadata = {
  title: '레벨 갤러리 | 성장닷컴',
  description: '학생들의 레벨업 캐릭터 카드를 확인하세요',
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              🌱 성장닷컴
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/gallery" className="text-sm font-medium text-gray-900">
                갤러리
              </Link>
              <Link href="/auth/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                로그인
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">레벨 갤러리</h1>
            <p className="text-muted-foreground">
              레벨업 달성 학생들의 멋진 캐릭터 카드를 확인하세요!
            </p>
          </div>
          
          <GalleryClient />
        </div>
      </main>
    </div>
  )
}