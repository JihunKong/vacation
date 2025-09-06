'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { School, Settings } from "lucide-react"
import { SchoolSetupModal } from './school-setup-modal'

interface SchoolChangeButtonProps {
  currentSchool: any
  currentRole: string
  showAsButton?: boolean
}

export default function SchoolChangeButton({ 
  currentSchool, 
  currentRole,
  showAsButton = false 
}: SchoolChangeButtonProps) {
  const [showModal, setShowModal] = useState(false)

  if (!showAsButton && !currentSchool) {
    return null
  }

  return (
    <>
      <Button
        size={showAsButton ? "default" : "sm"}
        variant={showAsButton ? "default" : "outline"}
        onClick={() => setShowModal(true)}
      >
        {currentSchool ? (
          <>
            <Settings className="h-4 w-4 mr-2" />
            학교 변경
          </>
        ) : (
          <>
            <School className="h-4 w-4 mr-2" />
            학교 설정하기
          </>
        )}
      </Button>
      
      {showModal && (
        <SchoolSetupModal 
          open={showModal} 
          onClose={() => setShowModal(false)}
          isChanging={!!currentSchool}
          currentRole={currentRole}
        />
      )}
    </>
  )
}