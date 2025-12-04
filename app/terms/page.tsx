import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '서비스 이용약관 | 스터디로그',
  description: '스터디로그 서비스 이용약관입니다.',
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-8">서비스 이용약관</h1>
          
          <p className="text-gray-600 mb-8">
            시행일: 2025년 8월 1일
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p>
              이 약관은 스터디로그(이하 &ldquo;회사&rdquo;)이 제공하는 학습 기록 관리 및 게이미피케이션 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
            <p className="mb-4">이 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                <strong>&ldquo;서비스&rdquo;</strong>란 회사가 제공하는 학습 기록 관리, 통계 분석, 게이미피케이션, AI 동기부여 등의 
                모든 서비스를 의미합니다.
              </li>
              <li className="mb-2">
                <strong>&ldquo;회원&rdquo;</strong>이란 이 약관에 따라 회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 
                이용하는 고객을 말합니다.
              </li>
              <li className="mb-2">
                <strong>&ldquo;아이디(ID)&rdquo;</strong>란 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 
                이메일 주소를 의미합니다.
              </li>
              <li className="mb-2">
                <strong>&ldquo;비밀번호&rdquo;</strong>란 회원이 부여받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 
                회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.
              </li>
              <li className="mb-2">
                <strong>&ldquo;경험치(XP)&rdquo;</strong>란 회원의 학습 활동에 따라 부여되는 가상의 포인트를 의미합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                이 약관은 서비스를 이용하고자 하는 모든 회원에게 그 효력이 발생합니다.
              </li>
              <li className="mb-2">
                회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
              </li>
              <li className="mb-2">
                약관이 개정되는 경우 회사는 변경사항을 시행일자 7일 전부터 공지사항을 통해 고지합니다.
              </li>
              <li className="mb-2">
                회원이 개정약관의 적용에 동의하지 않는 경우 회원 탈퇴를 할 수 있으며, 개정약관의 효력 발생일 이후에도 
                서비스를 계속 이용할 경우 약관 변경에 동의한 것으로 간주됩니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제4조 (회원가입)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 
                회원가입을 신청합니다.
              </li>
              <li className="mb-2">
                회사는 다음 각 호에 해당하는 신청에 대하여는 승인을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:
                <ul className="list-disc ml-6 mt-2">
                  <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                  <li>14세 미만 아동이 부모 등 법정대리인의 동의를 얻지 못한 경우</li>
                </ul>
              </li>
              <li className="mb-2">
                회원가입계약의 성립 시기는 회사의 승낙이 회원에게 도달한 시점으로 합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제5조 (서비스의 제공 및 변경)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                회사는 다음과 같은 서비스를 제공합니다:
                <ul className="list-disc ml-6 mt-2">
                  <li>학습 활동 기록 및 관리</li>
                  <li>학습 계획 수립 및 추적</li>
                  <li>통계 및 분석 리포트</li>
                  <li>게이미피케이션 요소 (레벨, 경험치, 배지, 능력치)</li>
                  <li>AI 기반 동기부여 메시지</li>
                  <li>뽀모도로 타이머</li>
                  <li>리더보드 및 소셜 기능</li>
                  <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
                </ul>
              </li>
              <li className="mb-2">
                회사는 서비스의 내용을 변경할 수 있으며, 변경된 서비스의 내용 및 제공일자를 제7조에서 정한 방법으로 
                이용자에게 통지합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제6조 (서비스의 중단)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                회사는 다음 각 호에 해당하는 경우 서비스 제공을 일시적으로 중단할 수 있습니다:
                <ul className="list-disc ml-6 mt-2">
                  <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
                  <li>전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지했을 경우</li>
                  <li>국가비상사태, 서비스 설비의 장애 또는 서비스 이용의 폭주 등으로 정상적인 서비스 제공이 불가능할 경우</li>
                </ul>
              </li>
              <li className="mb-2">
                회사는 제1항의 사유로 서비스가 중단된 경우 제7조에서 정한 방법으로 이용자에게 통지합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제7조 (회원에 대한 통지)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                회사가 회원에 대한 통지를 하는 경우 회원이 가입 시 제공한 이메일 주소로 할 수 있습니다.
              </li>
              <li className="mb-2">
                회사는 불특정다수 회원에 대한 통지의 경우 1주일 이상 서비스 내 공지사항에 게시함으로써 개별 통지에 
                갈음할 수 있습니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제8조 (회원의 의무)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                회원은 다음 행위를 하여서는 안 됩니다:
                <ul className="list-disc ml-6 mt-2">
                  <li>신청 또는 변경 시 허위 내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                  <li>서비스를 상업적 목적으로 이용하는 행위</li>
                  <li>비정상적인 방법으로 경험치를 획득하거나 시스템을 악용하는 행위</li>
                </ul>
              </li>
              <li className="mb-2">
                회원은 관계법령, 이 약관, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 
                준수하여야 합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제9조 (게이미피케이션 요소)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                회사는 서비스 내에서 경험치(XP), 레벨, 배지, 능력치 등의 게이미피케이션 요소를 제공합니다.
              </li>
              <li className="mb-2">
                게이미피케이션 요소는 회원의 학습 동기부여를 위한 가상의 보상이며, 현금 가치가 없습니다.
              </li>
              <li className="mb-2">
                회사는 서비스 운영상 필요한 경우 게이미피케이션 요소의 획득 조건, 사용 방법 등을 변경할 수 있습니다.
              </li>
              <li className="mb-2">
                일일 경험치 획득에는 카테고리별 제한이 있으며, 구체적인 제한 사항은 서비스 내에 명시됩니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제10조 (저작권 및 지적재산권)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                서비스에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.
              </li>
              <li className="mb-2">
                회원이 서비스 내에서 작성한 학습 기록, 계획 등의 콘텐츠에 대한 권리는 회원에게 있습니다.
              </li>
              <li className="mb-2">
                회원은 서비스를 이용함으로써 얻은 정보 중 회사에 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 
                복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
              </li>
              <li className="mb-2">
                AI로 생성된 캐릭터 이미지의 저작권은 회사와 회원이 공동으로 보유하며, 회원은 비상업적 목적으로 자유롭게 
                사용할 수 있습니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제11조 (개인정보보호)</h2>
            <p>
              회사는 회원의 개인정보를 보호하기 위하여 관련 법령이 정하는 바를 준수합니다. 
              개인정보의 보호 및 이용에 대해서는 관련법령 및 회사의 개인정보처리방침이 적용됩니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제12조 (회원탈퇴 및 자격 상실)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                회원은 언제든지 서비스 내 &ldquo;회원탈퇴&rdquo; 기능을 통해 탈퇴를 요청할 수 있으며, 회사는 즉시 회원탈퇴를 처리합니다.
              </li>
              <li className="mb-2">
                회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다:
                <ul className="list-disc ml-6 mt-2">
                  <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                  <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                  <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                  <li>비정상적인 방법으로 서비스를 이용하거나 시스템을 악용한 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제13조 (책임제한)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 
                관한 책임이 면제됩니다.
              </li>
              <li className="mb-2">
                회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
              </li>
              <li className="mb-2">
                회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 
                책임을 지지 않습니다.
              </li>
              <li className="mb-2">
                회사는 서비스 이용과 관련하여 회원에게 발생한 손해 중 회원의 고의, 과실에 의한 손해에 대하여 
                책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제14조 (분쟁해결)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                회사는 회원으로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.
              </li>
              <li className="mb-2">
                회사와 회원 간에 발생한 전자상거래 분쟁과 관련하여 회원의 피해구제신청이 있는 경우에는 
                공정거래위원회 또는 시·도지사가 의뢰하는 소비자분쟁조정위원회의 조정에 따를 수 있습니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">제15조 (재판권 및 준거법)</h2>
            <ol className="list-decimal ml-6">
              <li className="mb-2">
                이 약관에 명시되지 않은 사항은 관련 법령 또는 상관례에 따릅니다.
              </li>
              <li className="mb-2">
                서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 민사소송법상의 관할법원에 제기합니다.
              </li>
              <li className="mb-2">
                회사와 회원 간에 제기된 소송에는 대한민국 법을 적용합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">부칙</h2>
            <p>이 약관은 2025년 8월 1일부터 시행합니다.</p>
          </section>

        </div>
      </main>
    </div>
  )
}