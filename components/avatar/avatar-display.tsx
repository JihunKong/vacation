"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { STAT_DESCRIPTIONS, type StatType } from "@/lib/game/stats"

interface AvatarDisplayProps {
  level: number
  experience: number
  requiredXP: number
  stats: {
    strength: number
    intelligence: number
    dexterity: number
    charisma: number
    vitality: number
  }
}

export function AvatarDisplay({ level, experience, requiredXP, stats }: AvatarDisplayProps) {
  const xpProgress = (experience / requiredXP) * 100
  
  // 능력치 최대값 계산 - 모든 능력치 중 최고값을 기준으로 스케일링
  const maxStatValue = Math.max(...Object.values(stats))
  // 최소 100, 최대값의 125%를 상한선으로 설정 (여유공간 확보)
  const statScale = Math.max(100, Math.ceil(maxStatValue * 1.25 / 50) * 50)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>나의 아바타</span>
          <span className="text-2xl font-bold">Lv. {level}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 경험치 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>경험치</span>
            <span>{experience} / {requiredXP} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* 능력치 */}
        <div className="space-y-3">
          {(Object.keys(stats) as StatType[]).map((stat) => {
            const { name, icon } = STAT_DESCRIPTIONS[stat]
            const value = stats[stat]
            const percentage = (value / statScale) * 100
            
            return (
              <div key={stat} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span>{name}</span>
                  </span>
                  <span className="font-bold">
                    {value}
                    {statScale > 100 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        / {statScale}
                      </span>
                    )}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  indicatorClassName={getStatColor(stat)}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatColor(stat: StatType): string {
  const colors: Record<StatType, string> = {
    strength: "bg-red-500",
    intelligence: "bg-blue-500",
    dexterity: "bg-green-500",
    charisma: "bg-purple-500",
    vitality: "bg-orange-500",
  }
  return colors[stat]
}