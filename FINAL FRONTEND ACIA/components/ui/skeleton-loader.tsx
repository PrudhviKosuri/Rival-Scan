import type * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  variant?: "block" | "text"
}

function SkeletonLoader({ className, lines = 3, variant = "text", ...props }: SkeletonLoaderProps) {
  if (variant === "block") {
    return <div className={cn("h-40 animate-pulse rounded-lg bg-slate-800", className)} {...props} />
  }

  return (
    <div className="space-y-3" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn("h-4 animate-pulse rounded bg-slate-800", i === lines - 1 && "w-4/5", className)} />
      ))}
    </div>
  )
}

export { SkeletonLoader }
