import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    label?: string
    error?: string
    icon?: React.ReactNode
  }
>(({ className, type, label, error, icon, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-base text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55247A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            icon && "pl-10",
            error && "border-red-600",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
