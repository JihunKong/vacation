import PomodoroTimer from '@/components/features/PomodoroTimer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '뽀모도로 타이머 | 스터디로그',
  description: '집중력을 높이는 뽀모도로 타이머로 효율적인 학습하기'
}

export default function TimerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">뽀모도로 타이머</h1>
          <p className="text-muted-foreground">
            25분 집중, 5분 휴식의 과학적인 학습법으로 효율을 높여보세요
          </p>
        </div>

        <PomodoroTimer />

        {/* 팁 섹션 */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              집중 팁
            </h3>
            <p className="text-sm text-muted-foreground">
              타이머 시작 전 목표를 명확히 설정하고, 방해 요소를 제거하세요.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              성장 보상
            </h3>
            <p className="text-sm text-muted-foreground">
              세션을 완료할 때마다 XP를 획득하고, 연속 달성시 보너스를 받아요.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">☕</span>
              휴식의 중요성
            </h3>
            <p className="text-sm text-muted-foreground">
              짧은 휴식은 다음 집중을 위한 충전 시간. 꼭 지켜주세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}