import { useState } from "react"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...props, id }
    
    // 간단한 alert로 대체 (실제로는 toast UI 컴포넌트 사용)
    if (props.variant === "destructive") {
      alert(`❌ ${props.title}\n${props.description || ""}`)
    } else {
      alert(`✅ ${props.title}\n${props.description || ""}`)
    }
    
    setToasts((prev) => [...prev, newToast])
    
    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id))
    }, 3000)
  }

  return { toast, toasts }
}