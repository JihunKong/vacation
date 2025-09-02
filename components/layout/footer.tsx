import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-white/90 backdrop-blur mt-auto">
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
  )
}