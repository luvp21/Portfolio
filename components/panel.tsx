"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, type PanInfo, useMotionValue } from "framer-motion"
import { X, Minimize2, CornerRightDown, Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PanelProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  onClose?: () => void
  position?: { x: number; y: number }
  onPositionChange?: (x: number, y: number) => void
  id: string
  zIndex?: number
  onFocus?: () => void
  isGridSnap?: boolean
  isMinimized?: boolean
  onMinimize?: () => void
  defaultWidth?: number
  defaultHeight?: number
  isPinned?: boolean
  onPinChange?: (isPinned: boolean) => void
  dragConstraints?: Partial<DOMRect> | React.RefObject<HTMLDivElement | null>;
}

export function Panel({
  title,
  icon,
  children,
  className,
  onClose,
  position = { x: 0, y: 0 },
  onPositionChange,
  id,
  zIndex = 1,
  onFocus,
  isGridSnap = false,
  isMinimized = false,
  onMinimize,
  defaultWidth = 400,
  defaultHeight = 400,
  isPinned = false,
  onPinChange,
  dragConstraints,
}: PanelProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [isDragging, setIsDragging] = useState(false)

  const x = useMotionValue(position.x)
  const y = useMotionValue(position.y)

  const panelRef = useRef<HTMLDivElement>(null)

  // Update motion values when position prop changes
  useEffect(() => {
    x.set(position.x)
    y.set(position.y)
  }, [position.x, position.y, x, y])

  const handleDragStart = () => {
    if (isPinned) return
    setIsDragging(true)
    if (onFocus) onFocus()
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isPinned) return
    setIsDragging(false)

    // Add some inertia
    const decay = 0.95
    const velocity = { x: info.velocity.x * decay, y: info.velocity.y * decay }

    // Update position with inertia
    const currentX = x.get()
    const currentY = y.get()

    let newX = currentX + velocity.x
    let newY = currentY + velocity.y

    // Apply grid snapping if enabled
    if (isGridSnap) {
      const gridSize = 20
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize
    }

    x.set(newX)
    y.set(newY)

    // Notify parent of position change
    if (onPositionChange) {
      onPositionChange(newX, newY)
    }
  }

  const handlePanelClick = () => {
    if (onFocus) onFocus()
  }

  const handlePinToggle = () => {
    if (onPinChange) {
      onPinChange(!isPinned)
    }
  }

  return (
    <motion.div
      ref={panelRef}
      className={cn(
        "bg-card rounded-lg shadow-lg overflow-hidden absolute",
        isDragging && !isPinned && "cursor-grabbing",
        isMinimized && "h-12 overflow-hidden",
        isPinned && "border-2 border-primary/30",
        className,
      )}
      style={{
        x,
        y,
        zIndex,
        width: isMinimized ? "auto" : size.width,
        height: isMinimized ? "auto" : size.height,
      }}
      drag={!isPinned && !isResizing}
      dragMomentum={true}
      dragElastic={0.1}
      dragConstraints={dragConstraints}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: isPinned ? 1 : 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      id={id}
      onClick={handlePanelClick}
    >
      {/* Panel Header */}
      <div
        className={cn(
          "flex items-center justify-between p-3 bg-muted/50 border-b",
          !isPinned && "cursor-grab",
          isDragging && !isPinned && "cursor-grabbing",
        )}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {onPinChange && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePinToggle}>
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
          )}
          {onMinimize && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMinimize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div className={cn("h-[calc(100%-3rem)] overflow-y-scroll hide-scrollbar", isMinimized && "hidden")}>{children}</div>

    </motion.div>
  )
}
