import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 24, className = "" }: LoadingSpinnerProps) {
  return <Loader2 className={`animate-spin ${className}`} size={size} aria-label="Loading" />
}


