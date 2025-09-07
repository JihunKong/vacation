'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, School, GraduationCap, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface School {
  neisCode: string
  name: string
  region: string
  district: string
  address: string
  schoolType: string
}

export function SchoolSetupModal({ 
  open, 
  onClose,
  isChanging = false,
  currentRole = 'STUDENT'
}: { 
  open: boolean
  onClose?: () => void
  isChanging?: boolean
  currentRole?: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>(currentRole as 'STUDENT' | 'TEACHER')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const router = useRouter()

  // 학교 검색
  const searchSchools = async () => {
    if (searchQuery.length < 2) {
      alert('검색어는 2자 이상 입력해주세요.')
      return
    }
    
    setSearching(true)
    try {
      const res = await fetch(`/api/schools/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSchools(data.schools)
      }
    } catch (error) {
      console.error('School search error:', error)
      alert('학교 검색 중 오류가 발생했습니다.')
    } finally {
      setSearching(false)
    }
  }

  // 학교 설정 저장
  const handleSave = async () => {
    if (!selectedSchool) {
      alert('학교를 선택해주세요.')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/user/school', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neisCode: selectedSchool.neisCode,
          role
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(isChanging ? '학교가 변경되었습니다.' : '학교 정보가 설정되었습니다.')
        if (onClose) onClose()
        router.refresh()
      } else {
        alert(data.error || '학교 설정 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('School setup error:', error)
      alert('학교 설정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isChanging ? '학교 변경' : '학교 설정'}</DialogTitle>
          <DialogDescription>
            {isChanging 
              ? '다른 학교로 변경할 수 있습니다. 역할은 변경할 수 없습니다.'
              : '학교를 선택하시면 학교별 리더보드를 이용할 수 있습니다. 교사로 등록하시면 같은 학교 학생들의 학습 현황을 확인할 수 있습니다.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 학교 검색 */}
          <div className="space-y-2">
            <Label htmlFor="school-search">학교 검색</Label>
            <div className="flex gap-2">
              <Input
                id="school-search"
                placeholder="학교명을 입력하세요 (예: 서울고등학교)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchSchools()}
              />
              <Button onClick={searchSchools} disabled={searching}>
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
            </div>
          </div>
          
          {/* 검색 결과 */}
          {schools.length > 0 && (
            <div className="space-y-2">
              <Label>검색 결과</Label>
              <ScrollArea className="h-48 border rounded-md">
                <div className="p-2 space-y-2">
                  {schools.map((school) => (
                    <Card
                      key={school.neisCode}
                      className={`cursor-pointer transition-colors ${
                        selectedSchool?.neisCode === school.neisCode
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedSchool(school)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{school.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {school.region} {school.district}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {school.address}
                            </p>
                          </div>
                          <School className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* 선택된 학교 */}
          {selectedSchool && (
            <div className="space-y-2">
              <Label>선택된 학교</Label>
              <Card className="border-primary">
                <CardContent className="p-3">
                  <p className="font-medium">{selectedSchool.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSchool.region} {selectedSchool.district}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* 역할 선택 - 학교 변경 시에는 숨김 */}
          {!isChanging && (
            <div className="space-y-2">
              <Label>역할 선택</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as 'STUDENT' | 'TEACHER')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="STUDENT" id="student" />
                  <Label htmlFor="student" className="flex items-center cursor-pointer">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    학생으로 등록
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TEACHER" id="teacher" />
                  <Label htmlFor="teacher" className="flex items-center cursor-pointer">
                    <Users className="h-4 w-4 mr-2" />
                    교사로 등록
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground">
                {role === 'TEACHER' 
                  ? '교사로 등록하면 같은 학교 학생들의 학습 현황을 확인할 수 있습니다.'
                  : '학생으로 등록하면 학습 활동을 기록하고 리더보드에 참여할 수 있습니다.'}
              </p>
            </div>
          )}
          
          {/* 학교 변경 시 현재 역할 표시 */}
          {isChanging && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">현재 역할:</span>{' '}
                <Badge variant={currentRole === 'TEACHER' ? 'default' : 'secondary'}>
                  {currentRole === 'TEACHER' ? '교사' : '학생'}
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                학교 변경 시 역할은 변경할 수 없습니다.
              </p>
            </div>
          )}
          
          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                나중에 설정
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!selectedSchool || loading}
            >
              {loading ? '저장 중...' : (isChanging ? '학교 변경 완료' : '학교 설정 완료')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}