'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Heart, Download, Filter, Sparkles, Crown, Medal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LevelCard from './LevelCard'
import HallOfFame from './HallOfFame'

interface LevelImage {
  id: string
  level: number
  imageUrl: string
  prompt: string
  strength: number
  intelligence: number
  dexterity: number
  charisma: number
  vitality: number
  totalXP: number
  totalMinutes: number
  likes: number
  isPublic: boolean
  createdAt: string
  student: {
    user: {
      name: string
      email: string
    }
  }
}

interface GalleryData {
  hallOfFame: LevelImage | null
  images: LevelImage[]
  total: number
  levelStats: Array<{ level: number; _count: { id: number } }>
}

export default function GalleryClient() {
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [offset, setOffset] = useState(0)
  const limit = 12

  useEffect(() => {
    loadGallery()
  }, [selectedLevel, offset])

  const loadGallery = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })
      
      if (selectedLevel) {
        params.append('level', selectedLevel.toString())
      }

      const res = await fetch(`/api/level-image/gallery?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setGalleryData(data)
      }
    } catch (error) {
      console.error('Failed to load gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (imageId: string) => {
    try {
      const res = await fetch(`/api/level-image/${imageId}/like`, {
        method: 'POST'
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        // 좋아요 수 업데이트
        setGalleryData(prev => {
          if (!prev) return null
          
          const updateLikes = (img: LevelImage) => {
            if (img.id === imageId) {
              return { ...img, likes: data.likes }
            }
            return img
          }
          
          return {
            ...prev,
            images: prev.images.map(updateLikes),
            hallOfFame: prev.hallOfFame?.id === imageId
              ? { ...prev.hallOfFame, likes: data.likes }
              : prev.hallOfFame
          }
        })
      } else if (res.status === 401) {
        // 로그인 필요 알림
        alert('좋아요를 누르려면 로그인이 필요합니다.')
        window.location.href = '/auth/signin'
      }
    } catch (error) {
      console.error('Failed to like image:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-pulse space-y-4">
          <div className="h-64 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    )
  }

  if (!galleryData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">갤러리를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const levelFilters = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  return (
    <div className="space-y-8">
      {/* 명예의 전당 */}
      {galleryData.hallOfFame && (
        <HallOfFame levelImage={galleryData.hallOfFame} onLike={() => handleLike(galleryData.hallOfFame!.id)} />
      )}

      {/* 레벨 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            레벨별 갤러리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLevel === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedLevel(null)
                setOffset(0)
              }}
            >
              전체
            </Button>
            {levelFilters.map(level => {
              const stats = galleryData.levelStats.find(s => s.level === level)
              const count = stats?._count.id || 0
              
              return (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedLevel(level)
                    setOffset(0)
                  }}
                  disabled={count === 0}
                  className="relative"
                >
                  Lv.{level}
                  {count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 px-1 py-0 text-xs"
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 갤러리 그리드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {galleryData.images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <LevelCard 
                levelImage={image} 
                onLike={() => handleLike(image.id)}
                isCompact
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 페이지네이션 */}
      {galleryData.total > limit && (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
          >
            이전
          </Button>
          <span className="flex items-center px-4">
            {Math.floor(offset / limit) + 1} / {Math.ceil(galleryData.total / limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= galleryData.total}
          >
            다음
          </Button>
        </div>
      )}

      {/* 빈 상태 */}
      {galleryData.images.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">아직 레벨 카드가 없습니다</h3>
            <p className="text-muted-foreground">
              레벨 10, 20, 30... 에 도달하면 멋진 캐릭터 카드가 생성됩니다!
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}