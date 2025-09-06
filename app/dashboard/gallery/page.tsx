import { Metadata } from 'next'
import GalleryClient from '@/components/features/GalleryClient'

export const metadata: Metadata = {
  title: '레벨 갤러리 | 성장닷컴',
  description: '학생들의 레벨업 캐릭터 카드를 확인하세요',
}

export default function GalleryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">레벨 갤러리</h1>
          <p className="text-muted-foreground">
            레벨업 달성 학생들의 멋진 캐릭터 카드를 확인하세요!
          </p>
        </div>
        
        <GalleryClient />
      </div>
    </div>
  )
}