"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { User, Briefcase, Moon, Sun, X, History, RotateCcw, FileText, Layers, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { CommandBar } from "@/components/command-bar"
import { ProfileCard } from "@/components/profile-card"
import { Panel } from "@/components/panel"
import { ProjectCard } from "@/components/project-card"
import { TechStack } from "@/components/tech-stack"
import { AchievementsCard } from "@/components/achievements-card"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { Dock } from "@/components/dock"
import { Sandbox } from "@/components/Sandbox"

type PanelType = "about" | "projects" | "experience" | "message" | "stack" | "achievements"

interface PanelState {
  active: boolean
  position: { x: number; y: number }
  minimized: boolean
  zIndex: number
  pinned: boolean
}

interface PanelDimensions {
  width: number
  height: number
}

// Simple responsive breakpoint hook
function useResponsive() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth
      setIsMobile(width < 768) // md breakpoint
      setIsTablet(width >= 768 && width < 1024) // lg breakpoint
    }

    checkResponsive()
    window.addEventListener("resize", checkResponsive)
    return () => window.removeEventListener("resize", checkResponsive)
  }, [])

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet }
}

// Default panel dimensions
const DEFAULT_PANEL_DIMENSIONS: Record<PanelType, PanelDimensions> = {
  about: { width: 450, height: 325 },
  projects: { width: 450, height: 890 },
  experience: { width: 450, height: 550 },
  message: { width: 920, height: 495 },
  stack: { width: 450, height: 380 },
  achievements: { width: 450, height: 380 },
}

// Fixed canvas size - no longer dynamic
const FIXED_CANVAS_SIZE = { width: 2000, height: 1000 }

// Calculate panel positions relative to the center of the viewport
const createDefaultPanelState = (
  centerX: number,
  centerY: number,
): Record<PanelType, PanelState> => {
  // Position panels around the center point
  const positions = {
    about: { x: centerX - 925, y: centerY - 450 },
    projects: { x: centerX + 475, y: centerY - 450 },
    experience: { x: centerX - 925, y: centerY - 110 },
    message: { x: centerX - 460, y: centerY - 55 },
    stack: { x: centerX - 460, y: centerY - 450 },
    achievements: { x: centerX + 10, y: centerY - 450 },
  }

  // Ensure positions are within canvas boundaries
  Object.keys(positions).forEach((key) => {
    const panelType = key as PanelType
    const dimensions = DEFAULT_PANEL_DIMENSIONS[panelType]
    const pos = positions[panelType]

    // Constrain x position
    pos.x = Math.max(0, Math.min(pos.x, FIXED_CANVAS_SIZE.width - dimensions.width))

    // Constrain y position
    pos.y = Math.max(0, Math.min(pos.y, FIXED_CANVAS_SIZE.height - dimensions.height))
  })

  return {
    about: { active: true, position: positions.about, minimized: false, zIndex: 1, pinned: false },
    projects: { active: true, position: positions.projects, minimized: false, zIndex: 1, pinned: false },
    experience: { active: true, position: positions.experience, minimized: false, zIndex: 1, pinned: false },
    message: { active: true, position: positions.message, minimized: false, zIndex: 1, pinned: false },
    stack: { active: true, position: positions.stack, minimized: false, zIndex: 1, pinned: false },
    achievements: {
      active: true,
      position: positions.achievements,
      minimized: false,
      zIndex: 1,
      pinned: false,
    },
  }
}

// Ensure all panels are within canvas boundaries
const constrainPanelsToCanvas = (
  panels: Record<PanelType, PanelState>,
): Record<PanelType, PanelState> => {
  const updatedPanels = { ...panels }

  Object.entries(updatedPanels).forEach(([key, panel]) => {
    const panelType = key as PanelType
    const dimensions = DEFAULT_PANEL_DIMENSIONS[panelType]

    // Constrain x position
    const maxX = FIXED_CANVAS_SIZE.width - dimensions.width
    panel.position.x = Math.max(0, Math.min(panel.position.x, maxX))

    // Constrain y position
    const maxY = FIXED_CANVAS_SIZE.height - dimensions.height
    panel.position.y = Math.max(0, Math.min(panel.position.y, maxY))
  })

  return updatedPanels
}

export default function PortfolioInterface() {
  const [showCommandBar, setShowCommandBar] = useState(false)
  const [highestZIndex, setHighestZIndex] = useState(1)
  const { isMobile, isTablet } = useResponsive()
  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 })
  const [panels, setPanels] = useState<Record<PanelType, PanelState>>({} as Record<PanelType, PanelState>)
  const [isInitialized, setIsInitialized] = useState(false)
  const [resetKey, setResetKey] = useState(0) // Used to force re-render

  const { setTheme, theme } = useTheme()

  // Center the canvas view
  const centerCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && viewportSize.width > 0) {
      // Get the center of the canvas
      const canvasCenterX = FIXED_CANVAS_SIZE.width / 2
      const canvasCenterY = FIXED_CANVAS_SIZE.height / 2

      // Calculate scroll position to center the viewport on the canvas center
      const scrollLeft = canvasCenterX - viewportSize.width / 2
      const scrollTop = canvasCenterY - viewportSize.height / 2

      // Set scroll position directly without animation
      canvasContainerRef.current.scrollLeft = scrollLeft
      canvasContainerRef.current.scrollTop = scrollTop
    }
  }, [viewportSize])

  // Initialize canvas and panels
  useEffect(() => {
    if (canvasContainerRef.current && !isInitialized) {
      const viewport = canvasContainerRef.current.getBoundingClientRect()
      setViewportSize({ width: viewport.width, height: viewport.height })

      // Calculate center of the canvas (not viewport)
      const centerX = FIXED_CANVAS_SIZE.width / 2
      const centerY = FIXED_CANVAS_SIZE.height / 2

      // Initialize panels around the center
      const initialPanels = createDefaultPanelState(centerX, centerY)

      // Try to load saved panel positions
      const saved = localStorage.getItem("portfolioPanels")
      if (saved) {
        try {
          const savedPanels = JSON.parse(saved)

          // Ensure saved panels are within canvas boundaries
          const constrainedPanels = constrainPanelsToCanvas(savedPanels)
          setPanels(constrainedPanels)
        } catch (e) {
          console.error("Error loading saved panels:", e)
          setPanels(initialPanels)
        }
      } else {
        setPanels(initialPanels)
      }

      setIsInitialized(true)
    }
  }, [canvasContainerRef, isInitialized, resetKey])

  // Center canvas after initialization and viewport size is set
  useEffect(() => {
    if (isInitialized && viewportSize.width > 0 && viewportSize.height > 0) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        centerCanvas()
      })
    }
  }, [isInitialized, viewportSize, centerCanvas, resetKey])

  // Save positions when they change
  useEffect(() => {
    if (isInitialized && !isMobile && Object.keys(panels).length > 0) {
      localStorage.setItem("portfolioPanels", JSON.stringify(panels))
    }
  }, [panels, isMobile, isInitialized])

  // Handle canvas dragging
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only allow dragging with left mouse button on empty canvas space
    if (e.button === 0 && e.target === canvasRef.current) {
      setIsDraggingCanvas(true)
      setStartDragPos({ x: e.clientX, y: e.clientY })
      e.preventDefault()

      // Change cursor to grabbing
      if (canvasContainerRef.current) {
        canvasContainerRef.current.style.cursor = "grabbing"
      }
    }
  }, [])

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingCanvas && canvasContainerRef.current) {
        const dx = e.clientX - startDragPos.x
        const dy = e.clientY - startDragPos.y

        canvasContainerRef.current.scrollLeft -= dx
        canvasContainerRef.current.scrollTop -= dy

        setStartDragPos({ x: e.clientX, y: e.clientY })
      }
    },
    [isDraggingCanvas, startDragPos],
  )

  const handleCanvasMouseUp = useCallback(() => {
    setIsDraggingCanvas(false)

    // Reset cursor
    if (canvasContainerRef.current) {
      canvasContainerRef.current.style.cursor = "default"
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || e.key === "/") {
        e.preventDefault()
        setShowCommandBar((prev) => !prev)
      }

      // Space to toggle drag mode
      if (e.key === " " && !e.repeat) {
        e.preventDefault()
        if (canvasContainerRef.current) {
          canvasContainerRef.current.style.cursor = "grab"
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        if (canvasContainerRef.current) {
          canvasContainerRef.current.style.cursor = "default"
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Update viewport size on window resize and re-center if needed
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current) {
        const viewport = canvasContainerRef.current.getBoundingClientRect()
        setViewportSize({ width: viewport.width, height: viewport.height })
        
        // Re-center canvas after resize
        setTimeout(() => {
          centerCanvas()
        }, 100)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [centerCanvas])

  const executeCommand = (command: string) => {
    const cmd = command.toLowerCase()

    const panelMap: Record<string, PanelType> = {
      about: "about",
      projects: "projects",
      experience: "experience",
      message: "message",
      stack: "stack",
      achievements: "achievements",
    }

    if (cmd in panelMap) {
      togglePanel(panelMap[cmd])
    } else if (["dark", "dark mode"].includes(cmd)) {
      setTheme("dark")
    } else if (["light", "light mode"].includes(cmd)) {
      setTheme("light")
    } else if (cmd === "reset") {
      resetPanelPositions()
    } else if (cmd === "center") {
      centerCanvas()
    }
  }

  const resetPanelPositions = () => {
    // Combined reset and center functionality

    // 1. Clear localStorage
    localStorage.removeItem("portfolioPanels")

    // 2. Reset state variables
    setHighestZIndex(1)
    setIsDraggingCanvas(false)

    // 3. Force component re-initialization by incrementing the reset key
    setIsInitialized(false)
    setResetKey((prev) => prev + 1)

    // 4. Reset any other state that might interfere
    if (canvasContainerRef.current) {
      canvasContainerRef.current.style.cursor = "default"
    }
  }

  const updatePanelPosition = (panel: PanelType, x: number, y: number) => {
    // Constrain panel position within canvas boundaries
    const dimensions = DEFAULT_PANEL_DIMENSIONS[panel]
    const constrainedX = Math.max(0, Math.min(x, FIXED_CANVAS_SIZE.width - dimensions.width))
    const constrainedY = Math.max(0, Math.min(y, FIXED_CANVAS_SIZE.height - dimensions.height))

    setPanels((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        position: { x: constrainedX, y: constrainedY },
      },
    }))
  }

  const togglePanel = (panel: PanelType) => {
    setPanels((prev) => {
      const newPanels = { ...prev }
      const isOpening = !prev[panel].active

      if (isOpening) {
        // Calculate center of the canvas (not viewport)
        const centerX = FIXED_CANVAS_SIZE.width / 2
        const centerY = FIXED_CANVAS_SIZE.height / 2

        // Get default positions relative to center
        const defaultPositions = createDefaultPanelState(centerX, centerY)

        newPanels[panel] = {
          ...prev[panel],
          active: true,
          minimized: false,
          position: defaultPositions[panel].position,
          zIndex: highestZIndex + 1,
        }
      } else {
        newPanels[panel] = {
          ...prev[panel],
          active: !prev[panel].active,
          minimized: false,
          zIndex: highestZIndex + 1,
        }
      }

      return newPanels
    })
    setHighestZIndex((prev) => prev + 1)
  }

  const minimizePanel = (panel: PanelType) => {
    setPanels((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        minimized: !prev[panel].minimized,
      },
    }))
  }

  const closePanel = (panel: PanelType) => {
    setPanels((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        active: false,
      },
    }))
  }

  const togglePinPanel = (panel: PanelType, isPinned: boolean) => {
    setPanels((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        pinned: isPinned,
      },
    }))
  }

  const bringToFront = (panel: PanelType) => {
    setPanels((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        zIndex: highestZIndex + 1,
      },
    }))
    setHighestZIndex((prev) => prev + 1)
  }

  const renderMobilePanel = (
    panelType: PanelType,
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode,
    maxHeight?: string,
  ) => {
    if (!panels[panelType]?.active) return null

    return (
      <div className="w-full border rounded-lg shadow-sm mb-4 bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium">{title}</h3>
          </div>
        </div>
        <div className={cn("p-4", maxHeight && `max-h-[${maxHeight}] overflow-y-auto`)}>{children}</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="flex-none h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="absolute top-4 left-4 z-[9999] flex items-center gap-2">
          <button
            onClick={() => setShowCommandBar(true)}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border cursor-pointer text-sm"
          >
            {isMobile ? 'Press for ?' : 'Press / for ?'}
          </button>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 z-[9999]">
          {!isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={resetPanelPositions}
              className="rounded-full relative group"
            >
              <RotateCcw className="h-4 w-4" />              
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="h-full overflow-y-auto">
            <div className="min-h-full pt-4 pb-20 space-y-4 p-4">
              {renderMobilePanel("about", "About Me", <User className="h-4 w-4" />, <ProfileCard />, "500px")}
              {renderMobilePanel("stack", "Tech Stack", <Layers className="h-4 w-4" />, <TechStack />, "500px")}
              {renderMobilePanel(
                "achievements",
                "Achievements",
                <Award className="h-4 w-4" />,
                <AchievementsCard />,
                "500px",
              )}
              {renderMobilePanel(
                "experience",
                "Experience",
                <History className="h-4 w-4" />,
                <div className="max-h-[600px] overflow-y-auto">
                  <ExperienceTimeline />
                </div>,
                "600px",
              )}
              {renderMobilePanel(
                "projects",
                "Projects",
                <Briefcase className="h-4 w-4" />,
                <div className="space-y-4 max-h-[800px] overflow-y-auto p-2">
                  <ProjectCard
                    title="Interactive Portfolio"
                    description="A canvas-based portfolio with draggable panels and Command Terminal"
                    tags={["Next.js", "Framer Motion", "Tailwind"]}
                    image="/portfolio.png"
                    githubUrl="https://github.com/luvp21/Portfolio"
                    liveUrl="https://portfolio-luvp21s-projects.vercel.app/"
                  />
                  <ProjectCard
                    title="EV Rental Website"
                    description="EV rental system with secure KYC, real-time tracking, and automated payments."
                    tags={["React", "Tailwind"]}
                    image="/erental.png"
                    githubUrl="https://github.com/mihir1816/Deep-Drillers-2.0"
                  />
                  <ProjectCard
                    title="Excalidraw Clone"
                    description="A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style."
                    tags={["TypeScript", "Next.js", "Tailwind", "Prisma"]}
                    image="/excalidraw.png"
                    githubUrl="https://github.com/luvp21/Draw-App"
                  />
                </div>,
                "800px",
              )}
              {renderMobilePanel(
                "message",
                "Message Constellation",
                <FileText className="h-4 w-4" />,
                <div className="h-[300px] sm:h-[400px]">
                  <Sandbox />
                </div>,
                "500px",
              )}
            </div>
          </div>
        ) : (
          /* Desktop Layout - Canvas with Scrolling (Hidden Scrollbars) */
          <div
            key={`canvas-container-${resetKey}`}
            ref={canvasContainerRef}
            className="absolute w-full h-full overflow-auto grid-snap-background hide-scrollbar rounded-lg border-cborder border-2"
            
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {/* Canvas Content */}
            <div
              ref={canvasRef}
              className="relative"
              style={{
                width: `${FIXED_CANVAS_SIZE.width}px`,
                height: `${FIXED_CANVAS_SIZE.height}px`,
              }}
            >
              {/* Desktop Panels */}
              {isInitialized &&
                Object.entries(panels).map(([key, panel]) => {
                  const panelType = key as PanelType

                  if (!panel.active) return null

                  return (
                    <Panel
                      key={`${panelType}-${resetKey}`}
                      title={
                        panelType === "about"
                          ? "About Me"
                          : panelType === "projects"
                            ? "Projects"
                            : panelType === "experience"
                              ? "Experience"
                              : panelType === "message"
                                ? "Leave a Message"
                                : panelType === "stack"
                                  ? "Tech Stack"
                                  : "Achievements"
                      }
                      icon={
                        panelType === "about" ? (
                          <User />
                        ) : panelType === "projects" ? (
                          <Briefcase />
                        ) : panelType === "experience" ? (
                          <History />
                        ) : panelType === "message" ? (
                          <FileText />
                        ) : panelType === "stack" ? (
                          <Layers />
                        ) : (
                          <Award />
                        )
                      }
                      onClose={() => closePanel(panelType)}
                      position={panel.position}
                      onPositionChange={(x, y) => updatePanelPosition(panelType, x, y)}
                      id={panelType}
                      zIndex={panel.zIndex}
                      onFocus={() => bringToFront(panelType)}
                      isMinimized={panel.minimized}
                      onMinimize={() => minimizePanel(panelType)}
                      defaultWidth={DEFAULT_PANEL_DIMENSIONS[panelType].width}
                      defaultHeight={DEFAULT_PANEL_DIMENSIONS[panelType].height}
                      isPinned={panel.pinned}
                      onPinChange={(isPinned) => togglePinPanel(panelType, isPinned)}
                      className="border-4 border-card"
                      canvasBoundaries={FIXED_CANVAS_SIZE}
                    >
                      {panelType === "about" && <ProfileCard />}

                      {panelType === "projects" && (
                        <div className="grid grid-cols-1 gap-4 p-4 overflow-y-auto max-h-[calc(100%-1rem)] hide-scrollbar">
                          <ProjectCard
                            title="Interactive Portfolio"
                            description="A canvas-based portfolio with draggable panels and Command Terminal"
                            tags={["Next.js", "Framer Motion", "Tailwind"]}
                            image="/portfolio.png"
                            githubUrl="https://github.com/luvp21/Portfolio"
                            liveUrl="https://portfolio-luvp21s-projects.vercel.app/"
                          />
                          <ProjectCard
                            title="EV Rental Website"
                            description="EV rental system with secure KYC, real-time tracking, and automated payments."
                            tags={["React", "Tailwind"]}
                            image="/erental.png"
                            githubUrl="https://github.com/mihir1816/Deep-Drillers-2.0"
                          />
                          <ProjectCard
                            title="Excalidraw Clone"
                            description="A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style."
                            tags={["TypeScript", "Next.js", "Tailwind", "Prisma"]}
                            image="/excalidraw.png"
                            githubUrl="https://github.com/luvp21/Draw-App"
                          />
                        </div>
                      )}

                      {panelType === "message" && <Sandbox />}

                      {panelType === "stack" && <TechStack />}

                      {panelType === "experience" && (
                        <div className="p-4 overflow-y-auto max-h-[calc(100%-1rem)] hide-scrollbar border-cborder">
                          <ExperienceTimeline />
                        </div>
                      )}

                      {panelType === "achievements" && <AchievementsCard />}
                    </Panel>
                  )
                })}
            </div>
          </div>
        )}

        {/* Command Bar */}
        <CommandBar open={showCommandBar} onOpenChange={setShowCommandBar} onExecuteCommand={executeCommand} />

      </div>

      {/* Footer - Only shows on desktop */}
      {!isMobile && (
        <footer className="flex-none bg-background/80 backdrop-blur-sm border-border/20 pt-3">
          <div className="h-full px-8 flex items-center justify-between">
            {/* Left side - Tech stack */}
            <div className="text-md text-muted-foreground/70">
              // Built with Next.js, Tailwind, and Supabase; <span className="text-name">thanks()</span>;
            </div>

            {/* Center - Dock */}
            <div className="flex-1 flex items-center justify-center">
              <Dock
                onOpenPanel={togglePanel}
                activePanels={Object.entries(panels)
                  .filter(([_, state]) => state.active)
                  .map(([key]) => key as PanelType)}
              />
            </div>

            {/* Right side - Copyright */}
            <div className="text-md text-muted-foreground/70">© 2024 Luv Patel. All rights reserved.</div>
          </div>
        </footer>
      )}
    </div>
  )
}