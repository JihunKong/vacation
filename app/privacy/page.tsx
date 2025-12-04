import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 | 스터디로그',
  description: '스터디로그 서비스의 개인정보처리방침입니다.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            🌱 스터디로그
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>
          
          <p className="text-gray-600 mb-8">
            시행일: 2025년 8월 1일
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p>
              스터디로그(이하 &ldquo;회사&rdquo;)은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수하고 있습니다.
              본 개인정보처리방침은 회사가 제공하는 학습 기록 관리 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사가 이용자로부터 수집하는 개인정보의 항목, 수집 및 이용 목적, 보유 및 이용 기간, 제3자 제공 등에 관한 사항을 안내드립니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제2조 (수집하는 개인정보의 항목)</h2>
            <p className="mb-4">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>
            
            <h3 className="text-xl font-semibold mb-2">1. 회원가입 시</h3>
            <ul className="list-disc ml-6 mb-4">
              <li>필수항목: 이메일 주소, 비밀번호, 이름</li>
              <li>선택항목: 프로필 이미지</li>
              <li>자동수집항목: 서비스 이용기록, 접속 로그, 쿠키, IP 정보</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">2. Google OAuth 로그인 시</h3>
            <ul className="list-disc ml-6 mb-4">
              <li>Google 계정 이메일</li>
              <li>Google 계정 이름</li>
              <li>Google 프로필 이미지 URL (선택)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">3. 서비스 이용 과정에서</h3>
            <ul className="list-disc ml-6">
              <li>학습 활동 기록 (활동명, 카테고리, 시간)</li>
              <li>학습 계획 및 목표</li>
              <li>성취도 및 통계 데이터</li>
              <li>생성된 캐릭터 이미지 및 프롬프트</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제3조 (개인정보의 수집 및 이용 목적)</h2>
            <p className="mb-4">회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다:</p>
            <ul className="list-disc ml-6">
              <li>회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정 이용 방지</li>
              <li>서비스 제공: 학습 기록 관리, 통계 제공, 레벨 시스템 운영, AI 기반 동기부여 메시지 제공</li>
              <li>서비스 개선: 신규 서비스 개발 및 맞춤 서비스 제공, 서비스 유효성 확인</li>
              <li>마케팅 및 광고: 이벤트 등 광고성 정보 전달 (선택 동의 시)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제4조 (개인정보의 보유 및 이용 기간)</h2>
            <p className="mb-4">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc ml-6">
              <li>회원 정보: 회원 탈퇴 시까지</li>
              <li>서비스 이용 기록: 회원 탈퇴 후 3개월</li>
              <li>법령에 따른 보존 의무가 있는 경우 해당 법령에서 정한 기간</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제5조 (개인정보의 제3자 제공)</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc ml-6 mt-4">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제6조 (개인정보의 파기)</h2>
            <p className="mb-4">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
            <p>파기 방법:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>전자적 파일 형태: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
              <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제7조 (이용자의 권리와 행사 방법)</h2>
            <p className="mb-4">이용자는 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
            <ul className="list-disc ml-6">
              <li>개인정보 열람요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="mt-4">
              권리 행사는 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제8조 (개인정보의 안전성 확보 조치)</h2>
            <p className="mb-4">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
            <ul className="list-disc ml-6">
              <li>개인정보의 암호화: 비밀번호는 암호화되어 저장 및 관리</li>
              <li>해킹 등에 대비한 기술적 대책: 보안프로그램 설치 및 주기적 갱신·점검</li>
              <li>개인정보에 대한 접근 제한: 데이터베이스 접근권한 관리</li>
              <li>접속기록의 보관 및 위변조 방지</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부)</h2>
            <p className="mb-4">
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 &lsquo;쿠키(cookie)&rsquo;를 사용합니다.
            </p>
            <p className="mb-4">쿠키의 사용 목적:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>로그인 상태 유지</li>
              <li>이용자의 사용 패턴 분석을 통한 서비스 개선</li>
            </ul>
            <p>
              이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제10조 (개인정보 보호책임자)</h2>
            <p className="mb-4">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">개인정보 보호책임자</p>
              <ul className="list-none">
                <li>성명: 공지훈</li>
                <li>이메일: purusil55@gmail.com</li>
              </ul>
            </div>
            <p className="mt-4">
              이용자는 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제11조 (개인정보처리방침의 변경)</h2>
            <p>
              이 개인정보처리방침은 2025년 8월 1일부터 적용됩니다.
              개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}