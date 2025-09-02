'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Download } from 'lucide-react'

export default function TestImagePage() {
  const [level, setLevel] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testImageGeneration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/level-image/test?level=${level}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate test image')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const generateRealImage = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/level-image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>레벨 이미지 생성 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="level">테스트 레벨 (10의 배수)</Label>
            <Input
              id="level"
              type="number"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value) || 10)}
              step={10}
              min={10}
              max={100}
              placeholder="10, 20, 30..."
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={testImageGeneration}
              disabled={loading || level % 10 !== 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '테스트 이미지 생성 (DB 저장 X)'
              )}
            </Button>

            <Button 
              onClick={generateRealImage}
              disabled={loading || level % 10 !== 0}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '실제 이미지 생성 (DB 저장 O)'
              )}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold">오류 발생:</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <p className="font-semibold">성공!</p>
                <p>{result.message}</p>
              </div>

              {result.imageUrl && (
                <div className="space-y-2">
                  <h3 className="font-semibold">생성된 이미지:</h3>
                  <div className="relative border rounded-lg overflow-hidden">
                    <img 
                      src={result.imageUrl} 
                      alt={`Level ${level} Character`}
                      className="w-full h-auto"
                    />
                    {result.imageUrl.endsWith('.svg') && (
                      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        플레이스홀더 이미지 (API 키 필요)
                      </div>
                    )}
                  </div>
                  <a
                    href={result.imageUrl}
                    download={`level-${level}.png`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    이미지 다운로드
                  </a>
                </div>
              )}

              {result.prompt && (
                <div className="space-y-2">
                  <h3 className="font-semibold">사용된 프롬프트:</h3>
                  <pre className="p-4 bg-gray-100 rounded-lg text-sm whitespace-pre-wrap">
                    {result.prompt}
                  </pre>
                </div>
              )}

              {result.stats && (
                <div className="space-y-2">
                  <h3 className="font-semibold">캐릭터 스탯:</h3>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-100 rounded-lg">
                    <div>레벨: {result.stats.level}</div>
                    <div>총 XP: {result.stats.totalXP}</div>
                    <div>힘: {result.stats.strength}</div>
                    <div>지능: {result.stats.intelligence}</div>
                    <div>민첩: {result.stats.dexterity}</div>
                    <div>매력: {result.stats.charisma}</div>
                    <div>활력: {result.stats.vitality}</div>
                    <div>총 시간: {Math.floor(result.stats.totalMinutes / 60)}시간</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}