import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Footer } from '@/components/layout/footer'
import AuthSessionProvider from '@/providers/session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: '스터디로그 - 게이미피케이션 학습 관리 시스템',
  description: '매일의 학습을 기록하고 게임처럼 즐기며 성장하는 학습 관리 플랫폼',
  keywords: '학습 관리, 스터디로그, 게이미피케이션, 학습 기록, 아바타 성장',
  authors: [{ name: '스터디로그 Team' }],
  creator: '스터디로그',
  publisher: '스터디로그',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: '스터디로그',
    description: '매일의 학습을 기록하고 게임처럼 즐기며 성장하세요!',
    type: 'website',
    locale: 'ko_KR',
    siteName: '스터디로그',
  },
  twitter: {
    card: 'summary_large_image',
    title: '스터디로그',
    description: '매일의 학습을 기록하고 게임처럼 즐기며 성장하세요!',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <AuthSessionProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <Toaster richColors position="top-right" />
        </AuthSessionProvider>
      </body>
    </html>
  )
}