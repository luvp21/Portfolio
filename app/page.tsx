"use client"

import { useEffect, useState, useRef } from "react"
import { User, Briefcase, Moon, Sun, X, History, RotateCcw, FileText, Layers, Award } from 'lucide-react'
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

const getDefaultPositions = (isMobile: boolean) => {
  if (isMobile) {
    return {
      about: { x: 10, y: 20 },
      projects: { x: 10, y: 40 },
      experience: { x: 10, y: 60 },
      message: { x: 10, y: 80 },
      stack: { x: 10, y: 100 },
      achievements: { x: 10, y: 120 },
    }
  } else {
    // Single default position for all non-mobile devices
    return {
      about: { x: 10, y: 10 },
      projects: { x: 1425, y: 10 },
      experience: { x: 10, y: 350 },
      message: { x: 480, y: 405 },
      stack: { x: 480, y: 10 },
      achievements: { x: 950, y: 10 },
    }
  }
}

const createDefaultPanelState = (isMobile: boolean): Record<PanelType, PanelState> => {
  const positions = getDefaultPositions(isMobile)
  const defaultActive = isMobile

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

export default function PortfolioInterface() {
  const [showCommandBar, setShowCommandBar] = useState(false)
  const [highestZIndex, setHighestZIndex] = useState(1)
  const { isMobile, isTablet } = useResponsive()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })

  const [panels, setPanels] = useState<Record<PanelType, PanelState>>(createDefaultPanelState(false))

  const { setTheme, theme } = useTheme()

  // Update container dimensions and panel positions when screen size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect()
        setContainerDimensions({ width, height })

        // Update panel positions based on new dimensions
        setPanels((prev) => {
          const newPositions = getDefaultPositions(isMobile)
          const updated = { ...prev }

          Object.keys(updated).forEach((key) => {
            const panelKey = key as PanelType
            if (newPositions[panelKey]) {
              updated[panelKey] = {
                ...updated[panelKey],
                position: newPositions[panelKey],
              }
            }
          })

          return updated
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [isMobile])

  // Load saved positions on mount (desktop only)
  useEffect(() => {
    if (!isMobile && containerDimensions.width > 0) {
      const saved = localStorage.getItem("portfolioPanels")
      if (saved) {
        try {
          const savedPanels = JSON.parse(saved)
          // Validate saved positions are within bounds
          Object.keys(savedPanels).forEach((key) => {
            const panel = savedPanels[key as PanelType]
            panel.position.x = Math.max(0, Math.min(panel.position.x, containerDimensions.width - 450))
            panel.position.y = Math.max(0, Math.min(panel.position.y, containerDimensions.height - 400))
          })
          setPanels(savedPanels)
        } catch (e) {
          console.error("Error loading saved panels:", e)
        }
      }
    }
  }, [isMobile, containerDimensions])

  // Save positions when they change (desktop only)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("portfolioPanels", JSON.stringify(panels))
    }
  }, [panels, isMobile])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || e.key === "/") {
        e.preventDefault()
        setShowCommandBar(prev => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
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
    setPanels(createDefaultPanelState(isMobile))
  }

  const updatePanelPosition = (panel: PanelType, x: number, y: number) => {
    if (!isMobile) {
      setPanels(prev => ({
        ...prev,
        [panel]: {
          ...prev[panel],
          position: { x, y },
        },
      }))
    }
  }

  const togglePanel = (panel: PanelType) => {
    setPanels((prev) => {
      const newPanels = { ...prev }
      const isOpening = !prev[panel].active

      if (isOpening) {
        const defaultPos = getDefaultPositions(isMobile)[panel]

        newPanels[panel] = {
          ...prev[panel],
          active: true,
          minimized: false,
          position: defaultPos,
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
    setPanels(prev => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        minimized: !prev[panel].minimized,
      },
    }))
  }

  const closePanel = (panel: PanelType) => {
    setPanels(prev => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        active: false,
      },
    }))
  }

  const togglePinPanel = (panel: PanelType, isPinned: boolean) => {
    setPanels(prev => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        pinned: isPinned,
      },
    }))
  }

  const bringToFront = (panel: PanelType) => {
    setPanels(prev => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        zIndex: highestZIndex + 1,
      },
    }))
    setHighestZIndex(prev => prev + 1)
  }

  const renderMobilePanel = (panelType: PanelType, title: string, icon: React.ReactNode, children: React.ReactNode, maxHeight?: string) => {
    if (!panels[panelType].active) return null

    return (
      <div className="w-full border rounded-lg shadow-sm mb-4 bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium">{title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => closePanel(panelType)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn("p-4", maxHeight && `max-h-[${maxHeight}] overflow-y-auto`)}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="flex-none h-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="absolute top-4 left-4 z-[9999] flex items-center gap-2">
          <button
            onClick={() => setShowCommandBar(true)}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border cursor-pointer text-sm"
          >
            Press / for ?
          </button>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 z-[9999]">
          {!isMobile && ( // Only show reset button on non-mobile devices
            <Button variant="outline" size="icon" onClick={resetPanelPositions} className="rounded-full">
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
      <div
        ref={canvasRef}
        className={cn(
          "relative flex-1 transition-all duration-500 overflow-hidden",
          isMobile ? "overflow-y-auto p-4" : "p-4 md:p-4"
        )}
      >
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="pt-4 pb-20 space-y-4">
            {renderMobilePanel("about", "About Me", <User className="h-4 w-4" />, <ProfileCard />, "500px")}
            {renderMobilePanel("stack", "Tech Stack", <Layers className="h-4 w-4" />, <TechStack />, "500px")}
            {renderMobilePanel("achievements", "Achievements", <Award className="h-4 w-4" />, <AchievementsCard />, "500px")}
            {renderMobilePanel("experience", "Experience", <History className="h-4 w-4" />, 
              <div className="max-h-[600px] overflow-y-auto">
                <ExperienceTimeline />
              </div>,
              "600px"
            )}
            {renderMobilePanel("projects", "Projects", <Briefcase className="h-4 w-4" />, 
              <div className="space-y-4 max-h-[800px] overflow-y-auto p-2">
                <ProjectCard
                  title="Interactive Portfolio"
                  description="A canvas-based portfolio with draggable panels and Command Terminal"
                  tags={["Next.js", "Framer Motion", "Tailwind"]}
                  image="/portfolio.png"
                />
                <ProjectCard
                  title="EV Rental Website"
                  description="EV rental system with secure KYC, real-time tracking, and automated payments."
                  tags={["React", "Tailwind"]}
                  image="/erental.png"
                />
                <ProjectCard
                  title="Excalidraw Clone"
                  description="A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style."
                  tags={["TypeScript", "Next.js", "Tailwind", "Prisma"]}
                  image="/excalidraw.png"
                />
              </div>,
              "800px"
            )}
            {renderMobilePanel("message", "Message Constellation", <FileText className="h-4 w-4" />, 
              <div className="h-[300px] sm:h-[400px]">
                <Sandbox />
              </div>,
              "500px"
            )}
          </div>
        ) : (
          /* Desktop Layout */
          <div className="relative w-full h-full overflow-auto hide-scrollbar grid-snap-background rounded-lg border-cborder border-2">
            {/* Desktop Panels */}
            {panels.about.active && (
              <Panel
                title="About Me"
                icon={<User />}
                onClose={() => closePanel("about")}
                position={panels.about.position}
                onPositionChange={(x, y) => updatePanelPosition("about", x, y)}
                id="about"
                zIndex={panels.about.zIndex}
                onFocus={() => bringToFront("about")}
                isMinimized={panels.about.minimized}
                onMinimize={() => minimizePanel("about")}
                defaultWidth={450}
                defaultHeight={325}
                isPinned={panels.about.pinned}
                onPinChange={(isPinned) => togglePinPanel("about", isPinned)}
                dragConstraints={canvasRef}
                className="border-4 border-card"
              >
                <ProfileCard />
              </Panel>
            )}

            {panels.projects.active && (
              <Panel
                title="Projects"
                icon={<Briefcase />}
                onClose={() => closePanel("projects")}
                position={panels.projects.position}
                onPositionChange={(x, y) => updatePanelPosition("projects", x, y)}
                id="projects"
                zIndex={panels.projects.zIndex}
                onFocus={() => bringToFront("projects")}
                isMinimized={panels.projects.minimized}
                onMinimize={() => minimizePanel("projects")}
                defaultWidth={450}
                defaultHeight={890}
                isPinned={panels.projects.pinned}
                onPinChange={(isPinned) => togglePinPanel("projects", isPinned)}
                dragConstraints={canvasRef}
                className="border-4 border-card"
              >
                <div className="grid grid-cols-1 gap-4 p-4 overflow-y-auto max-h-[calc(100%-1rem)] hide-scrollbar">
                  <ProjectCard
                    title="Interactive Portfolio"
                    description="A canvas-based portfolio with draggable panels and Command Terminal"
                    tags={["Next.js", "Framer Motion", "Tailwind"]}
                    image="/portfolio.png"
                  />
                  <ProjectCard
                    title="EV Rental Website"
                    description="EV rental system with secure KYC, real-time tracking, and automated payments."
                    tags={["React", "Tailwind"]}
                    image="/erental.png"
                  />
                  <ProjectCard
                    title="Excalidraw Clone"
                    description="A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style."
                    tags={["TypeScript", "Next.js", "Tailwind", "Prisma"]}
                    image="/excalidraw.png"
                  />
                </div>
              </Panel>
            )}

            {panels.message.active && (
              <Panel
                title="Message Constellation"
                icon={<FileText />}
                onClose={() => closePanel("message")}
                position={panels.message.position}
                onPositionChange={(x, y) => updatePanelPosition("message", x, y)}
                id="message"
                zIndex={panels.message.zIndex}
                onFocus={() => bringToFront("message")}
                isMinimized={panels.message.minimized}
                onMinimize={() => minimizePanel("message")}
                defaultWidth={920}
                defaultHeight={495}
                isPinned={panels.message.pinned}
                onPinChange={(isPinned) => togglePinPanel("message", isPinned)}
                dragConstraints={canvasRef}
                className="border-4 border-card"
              >
                <Sandbox />
              </Panel>
            )}

            {panels.stack.active && (
              <Panel
                title="Tech Stack"
                icon={<Layers />}
                onClose={() => closePanel("stack")}
                position={panels.stack.position}
                onPositionChange={(x, y) => updatePanelPosition("stack", x, y)}
                id="stack"
                zIndex={panels.stack.zIndex}
                onFocus={() => bringToFront("stack")}
                isMinimized={panels.stack.minimized}
                onMinimize={() => minimizePanel("stack")}
                defaultWidth={450}
                defaultHeight={380}
                isPinned={panels.stack.pinned}
                onPinChange={(isPinned) => togglePinPanel("stack", isPinned)}
                dragConstraints={canvasRef}
                className="border-4 border-card"
              >
                <TechStack />
              </Panel>
            )}

            {panels.experience.active && (
              <Panel
                title="Experience"
                icon={<History />}
                onClose={() => closePanel("experience")}
                position={panels.experience.position}
                onPositionChange={(x, y) => updatePanelPosition("experience", x, y)}
                id="experience"
                zIndex={panels.experience.zIndex}
                onFocus={() => bringToFront("experience")}
                isMinimized={panels.experience.minimized}
                onMinimize={() => minimizePanel("experience")}
                defaultWidth={450}
                defaultHeight={550}
                isPinned={panels.experience.pinned}
                onPinChange={(isPinned) => togglePinPanel("experience", isPinned)}
                dragConstraints={canvasRef}
                className="border-4 border-card"
              >
                <div className="p-4 overflow-y-auto max-h-[calc(100%-1rem)] hide-scrollbar border-cborder">
                  <ExperienceTimeline />
                </div>
              </Panel>
            )}

            {panels.achievements.active && (
              <Panel
                title="Achievements"
                icon={<Award />}
                onClose={() => closePanel("achievements")}
                position={panels.achievements.position}
                onPositionChange={(x, y) => updatePanelPosition("achievements", x, y)}
                id="achievements"
                zIndex={panels.achievements.zIndex}
                onFocus={() => bringToFront("achievements")}
                isMinimized={panels.achievements.minimized}
                onMinimize={() => minimizePanel("achievements")}
                defaultWidth={450}
                defaultHeight={380}
                isPinned={panels.achievements.pinned}
                onPinChange={(isPinned) => togglePinPanel("achievements", isPinned)}
                dragConstraints={canvasRef}
                className="border-4 border-card"
              >
                <AchievementsCard />
              </Panel>
            )}
          </div>
        )}

        {/* Command Bar */}
        <CommandBar 
          open={showCommandBar} 
          onOpenChange={setShowCommandBar} 
          onExecuteCommand={executeCommand} 
        />
      </div>

      {/* Footer - Only shows on desktop */}
      {!isMobile && (
        <footer className="flex-none bg-background/80 backdrop-blur-sm border-border/20">
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
            <div className="text-md text-muted-foreground/70">
              © 2024 Luv Patel. All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}