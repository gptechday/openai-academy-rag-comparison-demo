"use client"

import React from "react"
import { useToast } from "@/hooks/use-toast"
import { Toast, ToastDescription } from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id}
          variant={toast.type as "default" | "success" | "error" | "info"}
          onClose={() => dismiss(toast.id)}
          className="group"
        >
          <ToastDescription>{toast.message}</ToastDescription>
        </Toast>
      ))}
    </div>
  )
}