export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 갤러리는 인증 없이 접근 가능
  return <>{children}</>
}