'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { School, X } from "lucide-react"
import { SchoolSetupModal } from './school-setup-modal'

export function SchoolSetupBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [hasSchool, setHasSchool] = useState(true)

  useEffect(() => {
    // 학교 정보 확인
    checkSchoolStatus()
  }, [])

  const checkSchoolStatus = async () => {
    try {
      const res = await fetch('/api/user/school')
      if (res.ok) {
        const data = await res.json()
        if (!data.schoolId) {
          setHasSchool(false)
          // 로컬 스토리지에서 배너 숨김 상태 확인
          const hideBanner = localStorage.getItem('hideSchoolBanner')
          if (!hideBanner) {
            setShowBanner(true)
          }
        }
      }
    } catch (error) {
      console.error('Failed to check school status:', error)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // 7일 동안 배너 숨기기
    const hideUntil = new Date()
    hideUntil.setDate(hideUntil.getDate() + 7)
    localStorage.setItem('hideSchoolBanner', hideUntil.toISOString())
  }

  const handleSetup = () => {
    setShowModal(true)
    setShowBanner(false)
  }

  const handleModalClose = () => {
    setShowModal(false)
    checkSchoolStatus() // 학교 설정 후 상태 재확인
  }

  if (hasSchool || !showBanner) {
    return (
      <>
        {showModal && (
          <SchoolSetupModal open={showModal} onClose={handleModalClose} />
        )}
      </>
    )
  }

  return (
    <>
      <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <School className="h-4 w-4" />
        <AlertTitle>학교를 설정하고 더 많은 기능을 이용하세요!</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            학교를 설정하면 다음과 같은 기능을 이용할 수 있습니다:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-3">
            <li>우리 학교 학생들과 경쟁하는 학교별 리더보드</li>
            <li>교사 계정으로 학생들의 학습 현황 확인 (교사만)</li>
            <li>학교별 통계 및 순위 확인</li>
          </ul>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSetup}>
              <School className="h-4 w-4 mr-2" />
              지금 설정하기
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss}>
              <X className="h-4 w-4 mr-2" />
              나중에 하기
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      
      {showModal && (
        <SchoolSetupModal open={showModal} onClose={handleModalClose} />
      )}
    </>
  )
}