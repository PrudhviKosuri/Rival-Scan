import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success: "border border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        warning: "border border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200",
        danger: "border border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        info: "border border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
        primary: "border border-transparent bg-[#4B6CB7] text-white hover:bg-[#3A5093]",
        outline: "border border-border text-foreground hover:bg-gray-100",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
