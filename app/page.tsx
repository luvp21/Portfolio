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
import { PixelatedBanner } from "@/components/pixelated-banner"

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
  about: { width: 450, height: 300 },
  projects: { width: 500, height: 600 },
  experience: { width: 470, height: 550 },
  message: { width: 800, height: 500 },
  stack: { width: 450, height: 270 },
  achievements: { width: 450, height: 300 },
}

// Calculate panel positions relative to the center of the viewport
const createDefaultPanelState = (
  viewportWidth: number,
  viewportHeight: number,
): Record<PanelType, PanelState> => {
  // Calculate center of viewport
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2

  // Position panels around the center point (centered on panel, not top-left)
  const positions = {
    about: { x: centerX - DEFAULT_PANEL_DIMENSIONS.about.width / 2, y: centerY - DEFAULT_PANEL_DIMENSIONS.about.height / 2 },
    projects: { x: centerX - DEFAULT_PANEL_DIMENSIONS.projects.width / 2 + 50, y: centerY - DEFAULT_PANEL_DIMENSIONS.projects.height / 2 - 50 },
    experience: { x: centerX - DEFAULT_PANEL_DIMENSIONS.experience.width / 2 - 100, y: centerY - DEFAULT_PANEL_DIMENSIONS.experience.height / 2 },
    message: { x: centerX - DEFAULT_PANEL_DIMENSIONS.message.width / 2, y: centerY - DEFAULT_PANEL_DIMENSIONS.message.height / 2 - 60 },
    stack: { x: centerX - DEFAULT_PANEL_DIMENSIONS.stack.width / 2 - 50, y: centerY - DEFAULT_PANEL_DIMENSIONS.stack.height / 2 - 50 },
    achievements: { x: centerX - DEFAULT_PANEL_DIMENSIONS.achievements.width / 2 + 50, y: centerY - DEFAULT_PANEL_DIMENSIONS.achievements.height / 2 - 50 },
  }

  // Ensure positions are within viewport boundaries
  Object.keys(positions).forEach((key) => {
    const panelType = key as PanelType
    const dimensions = DEFAULT_PANEL_DIMENSIONS[panelType]
    const pos = positions[panelType]

    // Constrain x position
    pos.x = Math.max(0, Math.min(pos.x, viewportWidth - dimensions.width))

    // Constrain y position
    pos.y = Math.max(0, Math.min(pos.y, viewportHeight - dimensions.height))
  })

  return {
    about: { active: false, position: positions.about, minimized: false, zIndex: 1, pinned: false },
    projects: { active: false, position: positions.projects, minimized: false, zIndex: 1, pinned: false },
    experience: { active: false, position: positions.experience, minimized: false, zIndex: 1, pinned: false },
    message: { active: false, position: positions.message, minimized: false, zIndex: 1, pinned: false },
    stack: { active: false, position: positions.stack, minimized: false, zIndex: 1, pinned: false },
    achievements: {
      active: false,
      position: positions.achievements,
      minimized: false,
      zIndex: 1,
      pinned: false,
    },
  }
}

// Ensure all panels are within viewport boundaries
const constrainPanelsToViewport = (
  panels: Record<PanelType, PanelState>,
  viewportWidth: number,
  viewportHeight: number,
): Record<PanelType, PanelState> => {
  const updatedPanels = { ...panels }

  Object.entries(updatedPanels).forEach(([key, panel]) => {
    const panelType = key as PanelType
    const dimensions = DEFAULT_PANEL_DIMENSIONS[panelType]

    // Constrain x position
    const maxX = viewportWidth - dimensions.width
    panel.position.x = Math.max(0, Math.min(panel.position.x, maxX))

    // Constrain y position
    const maxY = viewportHeight - dimensions.height
    panel.position.y = Math.max(0, Math.min(panel.position.y, maxY))
  })

  return updatedPanels
}

export default function PortfolioInterface() {
  const [showCommandBar, setShowCommandBar] = useState(false)
  const [highestZIndex, setHighestZIndex] = useState(1)
  const { isMobile, isTablet } = useResponsive()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [panels, setPanels] = useState<Record<PanelType, PanelState>>({} as Record<PanelType, PanelState>)
  const [isInitialized, setIsInitialized] = useState(false)
  const [resetKey, setResetKey] = useState(0) // Used to force re-render

  const { setTheme, theme } = useTheme()

  // Initialize viewport size and panels
  useEffect(() => {
    if (canvasRef.current && !isInitialized) {
      // Get viewport size
      const viewport = canvasRef.current.getBoundingClientRect()
      const currentViewportSize = { width: viewport.width, height: viewport.height }
      setViewportSize(currentViewportSize)

      // Initialize panels with viewport size
      const initialPanels = createDefaultPanelState(currentViewportSize.width, currentViewportSize.height)

      // Try to load saved panel positions
      const saved = localStorage.getItem("portfolioPanels")
      if (saved) {
        try {
          const savedPanels = JSON.parse(saved)

          // Ensure saved panels are within viewport boundaries
          const constrainedPanels = constrainPanelsToViewport(
            savedPanels,
            currentViewportSize.width,
            currentViewportSize.height
          )
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
  }, [canvasRef, isInitialized, resetKey])

  // Update viewport size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const viewport = canvasRef.current.getBoundingClientRect()
        setViewportSize({ width: viewport.width, height: viewport.height })

        // Constrain panels to new viewport size
        if (isInitialized && Object.keys(panels).length > 0) {
          setPanels(prev => constrainPanelsToViewport(prev, viewport.width, viewport.height))
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isInitialized, panels])

  // Save positions when they change
  useEffect(() => {
    if (isInitialized && !isMobile && Object.keys(panels).length > 0) {
      localStorage.setItem("portfolioPanels", JSON.stringify(panels))
    }
  }, [panels, isMobile, isInitialized])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || e.key === "/") {
        e.preventDefault()
        setShowCommandBar((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

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
    }
  }

  const resetPanelPositions = () => {
    // Clear localStorage
    localStorage.removeItem("portfolioPanels")

    // Reset state variables
    setHighestZIndex(1)

    // Force component re-initialization by incrementing the reset key
    setIsInitialized(false)
    setResetKey((prev) => prev + 1)
  }

  const updatePanelPosition = (panel: PanelType, x: number, y: number) => {
    // Constrain panel position within viewport boundaries
    const dimensions = DEFAULT_PANEL_DIMENSIONS[panel]
    const vw = viewportSize.width || window.innerWidth
    const vh = viewportSize.height || window.innerHeight
    const constrainedX = Math.max(0, Math.min(x, vw - dimensions.width))
    const constrainedY = Math.max(0, Math.min(y, vh - dimensions.height))

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
        // Get default positions relative to viewport center
        const defaultPositions = createDefaultPanelState(viewportSize.width || window.innerWidth, viewportSize.height || window.innerHeight)

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
      <div className="w-full border rounded-lg shadow-sm mb-4 bg-card hide-scrollbar">
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
      <header className={`flex-none h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isMobile ? "border-b" : ""
        }`}>
        <div className="absolute inset-y-0 left-4 z-[9999] flex items-center gap-2">
          <button
            onClick={() => setShowCommandBar(true)}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border cursor-pointer text-sm hover:bg-background/90 transition-colors group"
            aria-label="Open command bar"
            aria-describedby="command-bar-help"
          >
            {isMobile ? (
              'Explore'
            ) : (
              <>
                <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 dark:bg-foreground/5 border border-foreground/20 dark:border-foreground/10 font-mono text-xs font-semibold group-hover:bg-foreground/15 transition-colors">/</kbd>
                <span>Command Bar</span>
              </>
            )}
          </button>
        </div>

        <div className="absolute inset-y-0 right-4 flex items-center gap-2 z-[9999]">
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
        {/* Pixelated Background Banner */}
        <PixelatedBanner
          isHidden={isInitialized && Object.values(panels).some(panel => panel.active)}
        />

        {/* Mobile Layout */}
        {isMobile ? (
          <div className={cn(
            "h-full overflow-y-auto hide-scrollbar",
            theme === "dark" ? "mobile-grid-dark" : "mobile-grid-light"
          )}>

            <div className="min-h-full pt-4 pb-20 space-y-4 px-3">
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
                "Experience & Education",
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
                <div className="space-y-4 max-h-[350px] overflow-y-auto p-2 hide-scrollbar">
                  <ProjectCard
                    title="Interactive Portfolio"
                    description="A canvas-based portfolio with draggable panels and Command Terminal"
                    tags={["Next.js", "TypeScript", "Tailwind", "React", "Vercel"]}
                    image="/portfolio.png"
                    githubUrl="https://github.com/luvp21/Portfolio"
                    liveUrl="https://portfolio-luvp21s-projects.vercel.app/"
                  />
                  <ProjectCard
                    title="EV Rental Website"
                    description="EV rental system with secure KYC, real-time tracking, and automated payments."
                    tags={["React", "Tailwind", "MongoDB", "Node.js", "Vercel"]} image="/erental.png"
                    githubUrl="https://github.com/mihir1816/Deep-Drillers-2.0"
                  />
                  <ProjectCard
                    title="Excalidraw Clone"
                    description="A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style."
                    tags={["TypeScript", "Next.js", "Tailwind", "Prisma", "PostgreSQL", "Socket.io"]} image="/excalidraw.png"
                    githubUrl="https://github.com/luvp21/Draw-App"
                  />
                </div>,
                "800px",
              )}
              {renderMobilePanel(
                "message",
                "Message Constellation",
                <FileText className="h-4 w-4" />,
                <div className="h-[500px] sm:h-[400px]">
                  <Sandbox />
                </div>,

                "500px",
              )}
            </div>
          </div>
        ) : (
          /* Desktop Layout - Canvas (No Scrolling) */
          <div
            key={`canvas-container-${resetKey}`}
            ref={canvasRef}
            className="absolute w-full h-full grid-snap-background rounded-lg"
          >
            {/* Desktop Panels */}
            {isInitialized && viewportSize.width > 0 && viewportSize.height > 0 &&
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
                    className="border border-blue-300/10"
                    canvasBoundaries={viewportSize.width > 0 && viewportSize.height > 0 ? viewportSize : { width: window.innerWidth, height: window.innerHeight }}
                  >
                    {panelType === "about" && <ProfileCard />}

                    {panelType === "projects" && (
                      <div className="grid grid-cols-1 gap-4 p-4 overflow-y-auto max-h-[calc(100%-1rem)] hide-scrollbar">
                        <ProjectCard
                          title="Interactive Portfolio"
                          description="A canvas-based portfolio with draggable panels and Command Terminal"
                          tags={["Next.js", "TypeScript", "Tailwind", "React", "Vercel"]} image="/portfolio.png"
                          githubUrl="https://github.com/luvp21/Portfolio"
                          liveUrl="https://portfolio-luvp21s-projects.vercel.app/"
                        />
                        <ProjectCard
                          title="EV Rental Website"
                          description="EV rental system with secure KYC, real-time tracking, and automated payments."
                          tags={["React", "Tailwind", "MongoDB", "Node.js", "Vercel"]}
                          image="/erental.png"
                          githubUrl="https://github.com/mihir1816/Deep-Drillers-2.0"
                        />
                        <ProjectCard
                          title="Excalidraw Clone"
                          description="A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style."
                          tags={["TypeScript", "Next.js", "Tailwind", "Prisma", "PostgreSQL", "Socket.io"]}
                          image="/excalidraw.png"
                          githubUrl="https://github.com/luvp21/Draw-App"
                        />
                      </div>
                    )}

                    {panelType === "message" && <Sandbox />}

                    {panelType === "stack" && <TechStack />}

                    {panelType === "experience" && (
                      <div className=" overflow-y-auto max-h-[calc(100%-1rem)] hide-scrollbar">
                        <ExperienceTimeline />
                      </div>
                    )}

                    {panelType === "achievements" && <AchievementsCard />}
                  </Panel>
                )
              })}
          </div>
        )}

        {/* Command Bar */}
        <CommandBar open={showCommandBar} onOpenChange={setShowCommandBar} onExecuteCommand={executeCommand} />

      </div>

      {/* Footer - Only shows on desktop */}
      {isMobile ? (
        // Desktop footer
        <div className=" bg-background/80 backdrop-blur-sm border-border/20 pt-3 border-t border-b">
          <div className="h-full px-4">
            <div className="text-sm text-muted-foreground/70">
              // Built with Next.js, Tailwind, and Supabase;{"        "}
              <span className="text-blue-400">thanks()</span>;
            </div>
          </div>
        </div>
      ) : (
        <footer className="flex-none bg-background/80 backdrop-blur-sm border-border/20 py-2">
          <div className="px-8 flex items-center">

            {/* Left side - Tech stack */}
            <div className="flex-1 text-md text-muted-foreground/70">
              // Built with Next.js, Tailwind, and Supabase;{" "}
              <span className="text-blue-400">thanks()</span>;
            </div>

            {/* Center - Dock (center column, perfectly centered) */}
            <div className="flex-1 flex items-center justify-center z-[9999]">
              <Dock
                onOpenPanel={togglePanel}
                activePanels={Object.entries(panels)
                  .filter(([_, state]) => state.active)
                  .map(([key]) => key as PanelType)}
              />
            </div>

            {/* Right side - Copyright */}
            <div className="flex-1 flex items-center justify-end text-md text-muted-foreground/70">
              © 2024 Luv Patel. All rights reserved.
            </div>

          </div>
        </footer>
      )}
    </div>
  )
}
