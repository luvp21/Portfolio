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

type PanelType = "about" | "projects" | "experience" | "resume" | "stack" | "achievements"

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
    window.addEventListener('resize', checkResponsive)
    return () => window.removeEventListener('resize', checkResponsive)
  }, [])

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet }
}

// Default panel positions based on screen size
const getDefaultPositions = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) {
    // Mobile: stack vertically with small offsets
    return {
      about: { x: 10, y: 20 },
      projects: { x: 10, y: 40 },
      experience: { x: 10, y: 60 },
      resume: { x: 10, y: 80 },
      stack: { x: 10, y: 100 },
      achievements: { x: 10, y: 120 },
    }
  } else if (isTablet) {
    // Tablet: two columns
    return {
      about: { x: 20, y: 20 },
      projects: { x: 420, y: 20 },
      experience: { x: 20, y: 380 },
      resume: { x: 420, y: 380 },
      stack: { x: 20, y: 740 },
      achievements: { x: 420, y: 740 },
    }
  } else {
    // Desktop: three columns
    return {
      about: { x: -10, y: 30 },
      projects: { x: 1400, y: 30 },
      experience: { x: -10, y: 380 },
      resume: { x: 460, y: 425 },
      stack: { x: 460, y: 30 },
      achievements: { x: 930, y: 30 },
    }
  }
}

const createDefaultPanelState = (isMobile: boolean, isTablet: boolean): Record<PanelType, PanelState> => {
  const positions = getDefaultPositions(isMobile, isTablet)
  
  return {
    about: { active: isMobile, position: positions.about, minimized: false, zIndex: 1, pinned: false },
    projects: { active: isMobile, position: positions.projects, minimized: false, zIndex: 1, pinned: false },
    experience: { active: isMobile, position: positions.experience, minimized: false, zIndex: 1, pinned: false },
    resume: { active: isMobile, position: positions.resume, minimized: false, zIndex: 1, pinned: false },
    stack: { active: isMobile, position: positions.stack, minimized: false, zIndex: 1, pinned: false },
    achievements: { active: isMobile, position: positions.achievements, minimized: false, zIndex: 1, pinned: false },
  }
}

const checkOverlap = (rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }) => {
  return !(rect1.x + rect1.width <= rect2.x || 
           rect2.x + rect2.width <= rect1.x || 
           rect1.y + rect1.height <= rect2.y || 
           rect2.y + rect2.height <= rect1.y);
};

const getPanelWidth = (panelType: PanelType): number => {
  switch (panelType) {
    case 'resume': return 920;
    default: return 450;
  }
};

const getPanelHeight = (panelType: PanelType): number => {
  switch (panelType) {
    case 'projects': return 905;
    case 'experience': return 560;
    case 'resume': return 505;
    default: return 380;
  }
};

const findAvailablePosition = (panelType: PanelType, defaultWidth: number = 450, defaultHeight: number = 400) => {
  const activePanels = Object.entries(createDefaultPanelState(false, false))
    .filter(([key, state]) => state.active && key !== panelType)
    .map(([key, state]) => ({
      x: state.position.x,
      y: state.position.y,
      width: getPanelWidth(key as PanelType),
      height: getPanelHeight(key as PanelType),
    }));

  // Start with default position
  let position = getDefaultPositions(false, false)[panelType];
  
  // If no active panels, use default
  if (activePanels.length === 0) {
    return position;
  }

  // Try to find a non-overlapping position
  const maxAttempts = 20;
  const stepSize = 30;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const testRect = {
      x: position.x,
      y: position.y,
      width: defaultWidth,
      height: defaultHeight,
    };

    const hasOverlap = activePanels.some(panel => checkOverlap(testRect, panel));
    
    if (!hasOverlap) {
      // Check if position is within viewport
      const maxX = window.innerWidth - defaultWidth - 20;
      const maxY = window.innerHeight - defaultHeight - 20;
      
      if (position.x <= maxX && position.y <= maxY && position.x >= 20 && position.y >= 20) {
        return position;
      }
    }

    // Try next position (cascade effect)
    if (attempt < 10) {
      position = { x: position.x + stepSize, y: position.y + stepSize };
    } else {
      // Try different areas
      position = {
        x: 20 + (attempt - 10) * 100,
        y: 20 + Math.floor((attempt - 10) / 5) * 150,
      };
    }
  }

  // Fallback to default if no good position found
  return getDefaultPositions(false, false)[panelType];
};

export default function PortfolioInterface() {
  const [showCommandBar, setShowCommandBar] = useState(false)
  const [highestZIndex, setHighestZIndex] = useState(1)
  const { isMobile, isTablet } = useResponsive()
  const [panels, setPanels] = useState<Record<PanelType, PanelState>>(
    createDefaultPanelState(false, false) // Default to desktop initially
  )

  const { setTheme, theme } = useTheme()
  const canvasRef = useRef<HTMLDivElement>(null)

  // Update panel positions and active states when screen size changes
  useEffect(() => {
    const newPositions = getDefaultPositions(isMobile, isTablet)
    const newPanelState = createDefaultPanelState(isMobile, isTablet)
    
    setPanels(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(key => {
        const panelKey = key as PanelType
        if (newPositions[panelKey]) {
          updated[panelKey] = {
            ...updated[panelKey],
            position: newPositions[panelKey],
            active: newPanelState[panelKey].active // Update active state based on screen size
          }
        }
      })
      return updated
    })
  }, [isMobile, isTablet])

  // Load saved positions on mount (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const saved = localStorage.getItem("portfolioPanels")
      if (saved) {
        try {
          setPanels(JSON.parse(saved))
        } catch (e) {
          console.error("Error loading saved panels:", e)
        }
      }
    }
  }, [isMobile])

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
      resume: "resume",
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
    setPanels(createDefaultPanelState(isMobile, isTablet))
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
    setPanels(prev => {
      const isCurrentlyActive = prev[panel].active;
      
      if (!isCurrentlyActive) {
        // Panel is being opened - find a good position
        const newPosition = findAvailablePosition(panel, getPanelWidth(panel), getPanelHeight(panel));
        
        return {
          ...prev,
          [panel]: {
            ...prev[panel],
            active: true,
            position: newPosition,
            minimized: false,
            zIndex: highestZIndex + 1,
          },
        };
      } else {
        // Panel is being closed
        return {
          ...prev,
          [panel]: {
            ...prev[panel],
            active: false,
          },
        };
      }
    });
    
    setHighestZIndex(prev => prev + 1)
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
      <div className="w-full border rounded-lg shadow-sm mb-4 ">
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
    <div className="min-h-screen w-full transition-colors duration-300 grid-snap-background ">
      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={cn(
          "relative w-screen h-screen transition-all duration-500 grid-snap-background",
          isMobile ? "overflow-y-auto p-4" : "p-4 md:p-8"
        )}
      >
        {/* Header Controls */}
        <div className="absolute top-4 left-4 z-[9999] flex items-center gap-2">
          <button
            onClick={() => setShowCommandBar(true)}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border cursor-pointer text-sm"
          >
            Press / for ?
          </button>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 z-[9999]">
          {(
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

        {/* Mobile Layout */}
        {isMobile ? (
          <div className="pt-20 pb-20 space-y-4">
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
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
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
            {renderMobilePanel("resume", "Message Constellation", <FileText className="h-4 w-4" />, 
              <div className="h-[300px] sm:h-[400px]">
                <Sandbox />
              </div>,
              "500px"
            )}
          </div>
        ) : (
          /* Desktop Layout */
          <div className="relative w-full h-full ">
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
                className = "border-4 border-card"
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
                defaultHeight={905}
                isPinned={panels.projects.pinned}
                onPinChange={(isPinned) => togglePinPanel("projects", isPinned)}
                dragConstraints={canvasRef}
                className = "border-4 border-card"
              >
                <div className="grid grid-cols-1 gap-4 p-4 overflow-y-auto max-h-[calc(100%-3rem)] hide-scrollbar">
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

            {panels.resume.active && (
              <Panel
                title="Message Constellation"
                icon={<FileText />}
                onClose={() => closePanel("resume")}
                position={panels.resume.position}
                onPositionChange={(x, y) => updatePanelPosition("resume", x, y)}
                id="resume"
                zIndex={panels.resume.zIndex}
                onFocus={() => bringToFront("resume")}
                isMinimized={panels.resume.minimized}
                onMinimize={() => minimizePanel("resume")}
                defaultWidth={920}
                defaultHeight={505}
                isPinned={panels.resume.pinned}
                onPinChange={(isPinned) => togglePinPanel("resume", isPinned)}
                dragConstraints={canvasRef}
                className = "border-4 border-card"
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
                className = "border-4 border-card"
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
                defaultHeight={560}
                isPinned={panels.experience.pinned}
                onPinChange={(isPinned) => togglePinPanel("experience", isPinned)}
                dragConstraints={canvasRef}
                className = "border-4 border-card"
              >
                <div className="p-4 overflow-y-auto max-h-[calc(100%-3rem)] hide-scrollbar">
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
                className = "border-4 border-card"
              >
                <AchievementsCard />
              </Panel>
            )}
          </div>
        )}

        {/* Dock - only show on desktop and tablet */}
        {(
          <Dock
            onOpenPanel={togglePanel}
            activePanels={Object.entries(panels)
              .filter(([_, state]) => state.active)
              .map(([key]) => key as PanelType)}
          />
        )}

        {/* Command Bar */}
        <CommandBar 
          open={showCommandBar} 
          onOpenChange={setShowCommandBar} 
          onExecuteCommand={executeCommand} 
        />
      </div>
    </div>
  )
}