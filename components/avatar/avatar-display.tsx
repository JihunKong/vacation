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
            
            return (
              <div key={stat} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span>{name}</span>
                  </span>
                  <span className="font-bold">{value}</span>
                </div>
                <Progress 
                  value={Math.min(value, 100)} 
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