"use client"

import type * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  description?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
}

export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
