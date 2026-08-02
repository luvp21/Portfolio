"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, type PanInfo, useMotionValue } from "framer-motion"
import { X, Minimize2, Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SPRING_SNAPPY } from "@/lib/motion"

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
  canvasScale?: number
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
  canvasScale = 1,
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

  // Shared drag start logic for mouse + touch
  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStartPos({ x: clientX, y: clientY })
    setInitialPanelPos({ x: x.get(), y: y.get() })
    if (onFocus) onFocus()
  }

  // Handle mouse down on title bar
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (isPinned) return

    // Only start dragging if clicking on the title bar itself, not on buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    startDrag(e.clientX, e.clientY)
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle touch start on title bar (tablets / touch devices)
  const handleTitleBarTouchStart = (e: React.TouchEvent) => {
    if (isPinned) return

    const target = e.target as HTMLElement
    if (target.closest('button')) return

    const touch = e.touches[0]
    if (!touch) return

    startDrag(touch.clientX, touch.clientY)
    e.stopPropagation()
  }

  // Handle mouse/touch move for dragging
  useEffect(() => {
    const updateDragPosition = (clientX: number, clientY: number) => {
      if (!isDragging || isPinned) return

      const deltaX = (clientX - dragStartPos.x) / canvasScale
      const deltaY = (clientY - dragStartPos.y) / canvasScale

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

    const handleMouseMove = (e: MouseEvent) => updateDragPosition(e.clientX, e.clientY)

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      // Prevent the page from scrolling while dragging a panel
      e.preventDefault()
      updateDragPosition(touch.clientX, touch.clientY)
    }

    const endDrag = () => {
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
      document.addEventListener('mouseup', endDrag)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', endDrag)
      document.addEventListener('touchcancel', endDrag)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', endDrag)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', endDrag)
        document.removeEventListener('touchcancel', endDrag)
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

  // Handle panel resizing via mouse
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startWidth = size.width
    const startHeight = size.height
    const startX = e.clientX
    const startY = e.clientY

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / canvasScale
      const deltaY = (moveEvent.clientY - startY) / canvasScale

      const minWidth = 280
      const minHeight = 200
      const maxX = canvasBoundaries.width - x.get()
      const maxY = canvasBoundaries.height - y.get()

      const newWidth = Math.max(minWidth, Math.min(startWidth + deltaX, maxX))
      const newHeight = Math.max(minHeight, Math.min(startHeight + deltaY, maxY))

      setSize({ width: newWidth, height: newHeight })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle panel resizing via touch (tablet/mobile simulation)
  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    setIsResizing(true)

    const touch = e.touches[0]
    const startWidth = size.width
    const startHeight = size.height
    const startX = touch.clientX
    const startY = touch.clientY

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0]
      const deltaX = (currentTouch.clientX - startX) / canvasScale
      const deltaY = (currentTouch.clientY - startY) / canvasScale

      const minWidth = 280
      const minHeight = 200
      const maxX = canvasBoundaries.width - x.get()
      const maxY = canvasBoundaries.height - y.get()

      const newWidth = Math.max(minWidth, Math.min(startWidth + deltaX, maxX))
      const newHeight = Math.max(minHeight, Math.min(startHeight + deltaY, maxY))

      setSize({ width: newWidth, height: newHeight })
    }

    const handleTouchEnd = () => {
      setIsResizing(false)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
  }

  return (
    <motion.div
      ref={panelRef}
      className={cn(
        "bg-card rounded-lg shadow-lg overflow-hidden absolute",
        isMinimized && "h-12 overflow-hidden",
        isPinned && "border-2 border-primary/30",
        isResizing && "ring-2 ring-primary/40",
        className,
      )}
      style={{
        x,
        y,
        zIndex,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: isDragging && !isPinned ? 1.02 : 1,
        width: size.width,
        // Collapse to a fixed titlebar height rather than "auto" — Framer
        // Motion measures "auto" targets by reading the DOM before the
        // content div's `hidden` class (driven by the same isMinimized
        // state) has actually applied, producing a wrong, stuck value.
        height: isMinimized ? 48 : size.height,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        ...SPRING_SNAPPY,
        width: { duration: 0.3, ease: "easeOut" },
        height: { duration: 0.3, ease: "easeOut" },
      }}
      id={id}
      onClick={handlePanelClick}
    >
      {/* Panel Header - Draggable Area */}
      <div
        ref={titleBarRef}
        className={cn(
          "flex items-center justify-between p-3 bg-muted/50 border-b touch-none",
          !isPinned && "cursor-grab select-none",
          isDragging && !isPinned && "cursor-grabbing",
        )}
        onMouseDown={handleTitleBarMouseDown}
        onTouchStart={handleTitleBarTouchStart}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="font-medium select-none">{title}</h3>
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

      {/* Aesthetic Scale-Aware Corner Resize Handle */}
      {!isMinimized && !isPinned && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1 select-none group"
          onMouseDown={handleResizeMouseDown}
          onTouchStart={handleResizeTouchStart}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="text-muted-foreground/30 group-hover:text-primary/70 active:text-primary transition-colors pointer-events-none"
          >
            <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="8" x2="8" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
