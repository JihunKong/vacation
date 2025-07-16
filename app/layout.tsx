import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '완도고등학교 여름방학 성장 퀘스트',
  description: '2025년 여름방학 자기주도적 성장을 위한 게임화 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}