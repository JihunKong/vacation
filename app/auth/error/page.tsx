'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: '서버 설정에 문제가 있습니다.',
    AccessDenied: '접근이 거부되었습니다. 관리자에게 문의하세요.',
    Verification: '인증 토큰이 만료되었거나 이미 사용되었습니다.',
    OAuthSignin: 'OAuth 로그인을 시작하는 중 오류가 발생했습니다.',
    OAuthCallback: 'OAuth 인증 응답 처리 중 오류가 발생했습니다.',
    OAuthCreateAccount: 'OAuth 계정 생성 중 오류가 발생했습니다.',
    EmailCreateAccount: '이메일 계정 생성 중 오류가 발생했습니다.',
    Callback: '인증 콜백 처리 중 오류가 발생했습니다.',
    OAuthAccountNotLinked: '이미 다른 방법으로 가입된 이메일입니다.',
    EmailSignin: '이메일 전송 중 오류가 발생했습니다.',
    CredentialsSignin: '로그인 정보가 올바르지 않습니다.',
    SessionRequired: '이 페이지에 접근하려면 로그인이 필요합니다.',
    Default: '인증 중 오류가 발생했습니다.',
    DatabaseError: '데이터베이스 연결 오류가 발생했습니다.'
  }

  const message = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            인증 오류
          </h2>
          <div className="mt-4 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{message}</p>
            {error && (
              <p className="mt-2 text-xs text-red-600">
                오류 코드: {error}
              </p>
            )}
          </div>
          
          <div className="mt-6 space-y-3">
            <Link href="/auth/signin">
              <Button className="w-full">
                다시 로그인하기
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 rounded-lg bg-gray-100 p-4 text-left">
              <p className="text-xs font-mono text-gray-600">
                Debug: {error}
              </p>
              <p className="text-xs font-mono text-gray-600">
                URL: {typeof window !== 'undefined' && window.location.href}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}