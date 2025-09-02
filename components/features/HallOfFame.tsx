'use client'

import { motion } from 'framer-motion'
import { Crown, Heart, Download, Calendar, Clock, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LevelImage {
  id: string
  level: number
  imageUrl: string
  strength: number
  intelligence: number
  dexterity: number
  charisma: number
  vitality: number
  totalXP: number
  totalMinutes: number
  likes: number
  createdAt: string
  student: {
    user: {
      name: string
      email: string
    }
  }
}

interface HallOfFameProps {
  levelImage: LevelImage
  onLike: () => void
}

export default function HallOfFame({ levelImage, onLike }: HallOfFameProps) {
  const totalHours = Math.floor(levelImage.totalMinutes / 60)
  const totalStats = levelImage.strength + levelImage.intelligence + 
                     levelImage.dexterity + levelImage.charisma + levelImage.vitality

  const handleDownload = async () => {
    // 이미지 다운로드 로직은 나중에 구현
    const link = document.createElement('a')
    link.href = levelImage.imageUrl
    link.download = `level-${levelImage.level}-card.png`
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-400 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 animate-pulse" />
              <span className="text-2xl font-bold">명예의 전당</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1 bg-white/20 text-white border-white/30">
              최고 레벨: Lv.{levelImage.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 이미지 섹션 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative rounded-lg overflow-hidden border-4 border-yellow-400 shadow-2xl">
                <img
                  src={levelImage.imageUrl}
                  alt={`Level ${levelImage.level} Character`}
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="text-xl px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                    Lv.{levelImage.level}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 정보 섹션 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {levelImage.student.user.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(levelImage.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} 달성
                </p>
              </div>

              {/* 능력치 */}
              <div className="space-y-3 p-4 bg-white/80 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">캐릭터 능력치</h4>
                <div className="space-y-2">
                  <StatBar label="STR" value={levelImage.strength} max={100} color="red" />
                  <StatBar label="INT" value={levelImage.intelligence} max={100} color="blue" />
                  <StatBar label="DEX" value={levelImage.dexterity} max={100} color="green" />
                  <StatBar label="CHA" value={levelImage.charisma} max={100} color="purple" />
                  <StatBar label="VIT" value={levelImage.vitality} max={100} color="orange" />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">총 능력치</span>
                    <span className="font-bold">{totalStats}</span>
                  </div>
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/80 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>총 경험치</span>
                  </div>
                  <p className="text-xl font-bold mt-1">{levelImage.totalXP.toLocaleString()} XP</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>학습 시간</span>
                  </div>
                  <p className="text-xl font-bold mt-1">{totalHours}시간</p>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onLike}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  좋아요 ({levelImage.likes})
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatBar({ 
  label, 
  value, 
  max, 
  color 
}: { 
  label: string
  value: number
  max: number
  color: string 
}) {
  const percentage = (value / max) * 100
  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium w-8">{label}</span>
      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]}`}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right">{value}</span>
    </div>
  )
}