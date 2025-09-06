import { redirect } from 'next/navigation'

export default function GalleryPage() {
  // 갤러리 페이지는 대시보드 갤러리로 리다이렉트
  redirect('/dashboard/gallery')
}