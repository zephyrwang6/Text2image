"use client"

import { useState, useCallback } from "react"

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastState extends ToastProps {
  id: string
  visible: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const toast = useCallback(({ title, description, variant = "default" }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)

    setToasts((prev) => [...prev, { id, title, description, variant, visible: true }])

    // 自动隐藏toast
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)))

      // 完全移除toast
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, 3000)

    return id
  }, [])

  return { toast, toasts }
}

export function Toast({ toast }: { toast: ToastState }) {
  const { title, description, variant, visible } = toast

  return (
    <div
      className={`
        fixed bottom-4 right-4 p-4 rounded-md shadow-md transition-opacity duration-300
        ${variant === "destructive" ? "bg-red-600 text-white" : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"}
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className="font-medium">{title}</div>
      {description && <div className="text-sm mt-1">{description}</div>}
    </div>
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </>
  )
}

