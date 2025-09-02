'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Heart, Download, User, Clock, Trophy, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import html2canvas from 'html2canvas'

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

interface LevelCardProps {
  levelImage: LevelImage
  onLike: () => void
  isCompact?: boolean
}

export default function LevelCard({ levelImage, onLike, isCompact = false }: LevelCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const totalHours = Math.floor(levelImage.totalMinutes / 60)
  const totalStats = levelImage.strength + levelImage.intelligence + 
                     levelImage.dexterity + levelImage.charisma + levelImage.vitality

  const getLevelTier = (level: number) => {
    if (level >= 40) return { color: 'from-yellow-500 to-amber-600', label: '전설' }
    if (level >= 30) return { color: 'from-purple-500 to-pink-600', label: '영웅' }
    if (level >= 20) return { color: 'from-blue-500 to-cyan-600', label: '엘리트' }
    return { color: 'from-gray-500 to-gray-600', label: '초보' }
  }

  const tier = getLevelTier(levelImage.level)

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return
    
    setIsDownloading(true)
    try {
      // 카드 캡처
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })
      
      // 다운로드
      const link = document.createElement('a')
      link.download = `${levelImage.student.user.name}-level-${levelImage.level}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  if (isCompact) {
    // 갤러리 그리드용 간단한 버전
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Card className="overflow-hidden cursor-pointer group">
          <div className="relative aspect-square">
            <img
              src={levelImage.imageUrl}
              alt={`Level ${levelImage.level}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`bg-gradient-to-r ${tier.color} border-0`}>
                    Lv.{levelImage.level}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{levelImage.likes}</span>
                  </div>
                </div>
                <p className="font-semibold">{levelImage.student.user.name}</p>
                <p className="text-xs opacity-90">{totalHours}시간 • {totalStats} 스탯</p>
              </div>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <Button size="sm" variant="ghost" onClick={onLike}>
                <Heart className="w-4 h-4 mr-1" />
                {levelImage.likes}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // 상세 카드 (다운로드용)
  return (
    <div ref={cardRef}>
      <Card className="overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{levelImage.student.user.name}</h3>
                <Badge variant="outline" className="mt-1">
                  {tier.label} 등급
                </Badge>
              </div>
              <Badge className={`text-lg px-3 py-1 bg-gradient-to-r ${tier.color} text-white border-0`}>
                Lv.{levelImage.level}
              </Badge>
            </div>

            {/* 이미지 */}
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={levelImage.imageUrl}
                alt={`Level ${levelImage.level} Character`}
                className="w-full h-auto"
              />
              <div className="absolute top-2 right-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            </div>

            {/* 능력치 */}
            <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-lg">
              <StatItem label="STR" value={levelImage.strength} />
              <StatItem label="INT" value={levelImage.intelligence} />
              <StatItem label="DEX" value={levelImage.dexterity} />
              <StatItem label="CHA" value={levelImage.charisma} />
              <StatItem label="VIT" value={levelImage.vitality} />
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-white rounded">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-xs text-muted-foreground">총 경험치</p>
                <p className="font-bold">{levelImage.totalXP.toLocaleString()}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">학습 시간</p>
                <p className="font-bold">{totalHours}시간</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
                <p className="text-xs text-muted-foreground">좋아요</p>
                <p className="font-bold">{levelImage.likes}</p>
              </div>
            </div>

            {/* 달성 날짜 */}
            <div className="text-center text-xs text-muted-foreground pt-2 border-t">
              {new Date(levelImage.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} 달성
            </div>
          </div>
        </CardContent>
        
        <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
      </Card>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}