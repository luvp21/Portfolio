"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, type PanInfo, useMotionValue } from "framer-motion"
import { X, Minimize2, Pin, PinOff } from "lucide-react"
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
  canvasBoundaries: { width: number; height: number }
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
  canvasBoundaries,
}: PanelProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [initialPanelPos, setInitialPanelPos] = useState({ x: 0, y: 0 })

  const x = useMotionValue(position.x)
  const y = useMotionValue(position.y)

  const panelRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)

  // Update motion values when position prop changes
  useEffect(() => {
    x.set(position.x)
    y.set(position.y)
  }, [position.x, position.y, x, y])

  // Ensure panel is within canvas boundaries when canvas size changes
  useEffect(() => {
    if (canvasBoundaries) {
      const currentX = x.get()
      const currentY = y.get()

      // Calculate boundaries
      const maxX = canvasBoundaries.width - size.width
      const maxY = canvasBoundaries.height - size.height

      // Constrain position
      const constrainedX = Math.max(0, Math.min(currentX, maxX))
      const constrainedY = Math.max(0, Math.min(currentY, maxY))

      // Update position if needed
      if (currentX !== constrainedX || currentY !== constrainedY) {
        x.set(constrainedX)
        y.set(constrainedY)

        if (onPositionChange) {
          onPositionChange(constrainedX, constrainedY)
        }
      }
    }
  }, [canvasBoundaries, size, x, y, onPositionChange])

  // Handle mouse down on title bar
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (isPinned) return
    
    // Only start dragging if clicking on the title bar itself, not on buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    setIsDragging(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
    setInitialPanelPos({ x: x.get(), y: y.get() })
    
    if (onFocus) onFocus()
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isPinned) return

      const deltaX = e.clientX - dragStartPos.x
      const deltaY = e.clientY - dragStartPos.y

      let newX = initialPanelPos.x + deltaX
      let newY = initialPanelPos.y + deltaY

      // Apply grid snapping if enabled
      if (isGridSnap) {
        const gridSize = 20
        newX = Math.round(newX / gridSize) * gridSize
        newY = Math.round(newY / gridSize) * gridSize
      }

      // Constrain to canvas boundaries
      const maxX = canvasBoundaries.width - size.width
      const maxY = canvasBoundaries.height - size.height

      newX = Math.max(0, Math.min(newX, maxX))
      newY = Math.max(0, Math.min(newY, maxY))

      x.set(newX)
      y.set(newY)
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        
        // Notify parent of final position
        if (onPositionChange) {
          onPositionChange(x.get(), y.get())
        }
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStartPos, initialPanelPos, x, y, onPositionChange, isPinned, isGridSnap, canvasBoundaries, size])

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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging && !isPinned ? 1.02 : 1 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      id={id}
      onClick={handlePanelClick}
    >
      {/* Panel Header - Draggable Area */}
      <div
        ref={titleBarRef}
        className={cn(
          "flex items-center justify-between p-3 bg-muted/50 border-b",
          !isPinned && "cursor-grab select-none",
          isDragging && !isPinned && "cursor-grabbing",
        )}
        onMouseDown={handleTitleBarMouseDown}
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

      {/* Panel Content - Non-draggable */}
      <div className={cn("h-[calc(100%-3rem)] overflow-y-scroll hide-scrollbar", isMinimized && "hidden")}>
        {children}
      </div>
    </motion.div>
  )
}