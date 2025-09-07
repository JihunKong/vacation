"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Confetti from "react-confetti"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LevelMilestoneCelebrationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  level: number
  previousLevel: number
}

export function LevelMilestoneCelebration({
  open,
  onOpenChange,
  level,
  previousLevel
}: LevelMilestoneCelebrationProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (open) {
      setShowConfetti(true)
      // 팡파르 사운드 효과 (Web Audio API)
      playFanfare()
      
      // 5초 후 confetti 중지
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [open])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const playFanfare = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // 팡파르 사운드 생성 (간단한 멜로디)
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = "sine"
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.15)
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * 0.15 + 0.05)
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + index * 0.15 + 0.4)
        
        oscillator.start(audioContext.currentTime + index * 0.15)
        oscillator.stop(audioContext.currentTime + index * 0.15 + 0.4)
      })
    } catch (error) {
      console.error("Audio playback failed:", error)
    }
  }

  const getMilestoneMessage = (level: number) => {
    const messages = {
      10: "🎉 첫 10레벨 달성! 이제 막 시작입니다!",
      20: "🌟 20레벨 달성! 놀라운 성장입니다!",
      30: "🚀 30레벨 달성! 엘리트가 되었습니다!",
      40: "💎 40레벨 달성! 전설의 시작입니다!",
      50: "👑 50레벨 달성! 절반의 여정을 완주했습니다!",
      60: "⚡ 60레벨 달성! 멈출 수 없는 성장!",
      70: "🔥 70레벨 달성! 최강의 길로!",
      80: "🌈 80레벨 달성! 정상이 보입니다!",
      90: "💫 90레벨 달성! 마지막 도전!",
      100: "🏆 100레벨 달성! 최고의 영예!"
    }
    return messages[level as keyof typeof messages] || `🎊 ${level}레벨 달성!`
  }

  const goToGallery = () => {
    onOpenChange(false)
    router.push("/dashboard/gallery")
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.1}
          colors={['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']}
        />
      )}
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] overflow-hidden">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <DialogHeader className="text-center pb-4">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto mb-4"
                  >
                    <Trophy className="w-20 h-20 text-yellow-500" />
                  </motion.div>
                  
                  <DialogTitle className="text-2xl font-bold">
                    {getMilestoneMessage(level)}
                  </DialogTitle>
                  
                  <DialogDescription className="text-lg mt-2">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      레벨 {previousLevel} → 레벨 {level}
                    </motion.div>
                  </DialogDescription>
                </DialogHeader>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                      <span className="font-bold text-yellow-800">특별 보상</span>
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-sm text-gray-700">
                      캐릭터 카드가 생성되었습니다!
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      갤러리에서 나만의 특별한 카드를 확인해보세요
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="flex-1"
                    >
                      계속하기
                    </Button>
                    <Button
                      onClick={goToGallery}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      갤러리 보기
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  )
}