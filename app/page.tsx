"use client"

import { useEffect, useState, useRef } from "react"
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

type PanelType = "about" | "projects" | "experience" | "resume" | "stack" | "achievements" | "theme"

enum ScreenSize {
  MOBILE = "mobile",
  TABLET = "tablet",
  DESKTOP = "desktop",
  LARGE = "large",
}

interface PanelState {
  active: boolean
  position: { x: number; y: number }
  minimized: boolean
  zIndex: number
  pinned: boolean
}

const getScreenSize = (): ScreenSize => {
  if (typeof window === "undefined") return ScreenSize.DESKTOP // Default for SSR

  const width = window.innerWidth
  if (width < 768) return ScreenSize.MOBILE
  if (width < 1024) return ScreenSize.TABLET
  if (width < 1440) return ScreenSize.DESKTOP
  return ScreenSize.LARGE
}

const getPanelPositions = (screenSize: ScreenSize) => {
  switch (screenSize) {
    case ScreenSize.MOBILE:
      return {
        about: { x: 0, y: 10 },
        projects: { x: 0, y: 20 },
        experience: { x: 0, y: 30 },
        resume: { x: 0, y: 40 },
        stack: { x: 0, y: 50 },
        achievements: { x: 0, y: 60 },
        theme: { x: 0, y: 70 },
      }
    case ScreenSize.TABLET:
      return {
        about: { x: 20, y: 20 },
        projects: { x: 500, y: 20 },
        experience: { x: 20, y: 360 },
        resume: { x: 180, y: 180 },
        stack: { x: 20, y: 700 },
        achievements: { x: 500, y: 360 },
        theme: { x: 300, y: 300 },
      }
    case ScreenSize.DESKTOP:
      return {
        about: { x: 20, y: 30 },
        projects: { x: 980, y: 30 },
        experience: { x: 20, y: 380 },
        resume: { x: 500, y: 180 },
        stack: { x: 500, y: 30 },
        achievements: { x: 500, y: 430 },
        theme: { x: 500, y: 350 },
      }
    case ScreenSize.LARGE:
      return {
        about: { x: -10, y: 30 },
        projects: { x: 1400, y: 30 },
        experience: { x: -10, y: 375 },
        resume: { x: 460, y: 430 },
        stack: { x: 460, y: 30 },
        achievements: { x: 930, y: 30 },
        theme: { x: 500, y: 350 },
      }
  }
}

const createDefaultPanelState = (screenSize: ScreenSize): Record<PanelType, PanelState> => {
  const positions = getPanelPositions(screenSize)

  return {
    about: { active: true, position: positions.about, minimized: false, zIndex: 1, pinned: false },
    projects: { active: true, position: positions.projects, minimized: false, zIndex: 1, pinned: false },
    experience: { active: true, position: positions.experience, minimized: false, zIndex: 1, pinned: false },
    resume: { active: true, position: positions.resume, minimized: false, zIndex: 1, pinned: false },
    stack: { active: true, position: positions.stack, minimized: false, zIndex: 1, pinned: false },
    achievements: { active: true, position: positions.achievements, minimized: false, zIndex: 1, pinned: false },
    theme: { active: false, position: positions.theme, minimized: false, zIndex: 1, pinned: false },
  }
}

export default function PortfolioInterface() {
  const [showCommandBar, setShowCommandBar] = useState(false)
  const [highestZIndex, setHighestZIndex] = useState(1)
  const [showDock, setShowDock] = useState(true)
  const [currentScreenSize, setCurrentScreenSize] = useState<ScreenSize>(
    typeof window !== "undefined" ? getScreenSize() : ScreenSize.DESKTOP,
  )
  const [isMobileView, setIsMobileView] = useState(false)

  const [panels, setPanels] = useState<Record<PanelType, PanelState>>(createDefaultPanelState(currentScreenSize))

  const { setTheme, theme } = useTheme()
  

  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initialScreenSize = getScreenSize()
    setCurrentScreenSize(initialScreenSize)
    setIsMobileView(initialScreenSize === ScreenSize.MOBILE)

    if (initialScreenSize !== ScreenSize.MOBILE) {
      const savedPanels = localStorage.getItem("portfolioPanels")
      if (savedPanels) {
        try {
          setPanels(JSON.parse(savedPanels))
        } catch (e) {
          console.error("Error loading saved panel positions", e)
          setPanels(createDefaultPanelState(initialScreenSize))
        }
      } else {
        setPanels(createDefaultPanelState(initialScreenSize))
      }
    } else {
      setPanels(createDefaultPanelState(initialScreenSize))
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const newScreenSize = getScreenSize()
      setCurrentScreenSize(newScreenSize)
      setIsMobileView(newScreenSize === ScreenSize.MOBILE)

      const wasMobile = isMobileView
      const isMobile = newScreenSize === ScreenSize.MOBILE

      if (wasMobile !== isMobile) {
        resetPanelPositions()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileView])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || e.key === "/") {
        e.preventDefault()
        setShowCommandBar((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isMobileView) {
      localStorage.setItem("portfolioPanels", JSON.stringify(panels))
    }
  }, [panels, isMobileView])

  const executeCommand = (command: string) => {
    const cmd = command.toLowerCase()

    const panelMap: Record<string, string> = {
      about: "about",
      a: "about",
      projects: "projects",
      p: "projects",
      experience: "experience",
      e: "experience",
      resume: "resume",
      cv: "resume",
      stack: "stack",
      achievements: "achievements",
      skills: "achievements",
      s: "achievements",
      theme: "theme",
    }

    if (cmd in panelMap) togglePanel(panelMap[cmd])
    else if (["dark", "dark mode"].includes(cmd)) setTheme("dark")
    else if (["light", "light mode"].includes(cmd)) setTheme("light")
    else if (cmd === "reset") resetPanelPositions()
    else if (cmd === "dock") setShowDock((prev) => !prev)
  }

  const resetPanelPositions = () => {
    setPanels(createDefaultPanelState(currentScreenSize))
  }

  const updatePanelPosition = (panel: PanelType, x: number, y: number) => {
    if (!isMobileView) {
      setPanels((prev) => ({
        ...prev,
        [panel]: {
          ...prev[panel],
          position: { x, y },
        },
      }))
    }
  }

  const togglePanel = (panel: PanelType) => {
    setPanels((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        active: !prev[panel].active,
        minimized: false,
        zIndex: highestZIndex + 1,
      },
    }))
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

  const renderMobilePanels = () => {
    return (
      <div className="flex flex-col gap-4 w-full px-2 py-4">
        {panels.about.active && (
          <div className="w-full border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h3 className="font-medium">About Me</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => closePanel("about")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <ProfileCard />
            </div>
          </div>
        )}

        {panels.stack.active && (
          <div className="w-full border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <h3 className="font-medium">Tech Stack</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => closePanel("stack")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <TechStack />
            </div>
          </div>
        )}

        {panels.achievements.active && (
          <div className="w-full border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <h3 className="font-medium">Achievements</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => closePanel("achievements")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <AchievementsCard />
            </div>
          </div>
        )}

        {panels.experience.active && (
          <div className="w-full border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <h3 className="font-medium">Experience</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => closePanel("experience")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto hide-scrollbar">
              <ExperienceTimeline />
            </div>
          </div>
        )}

        {panels.projects.active && (
          <div className="w-full border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <h3 className="font-medium">Projects</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => closePanel("projects")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 max-h-[800px] overflow-y-auto hide-scrollbar">
                <ProjectCard
                  title="Interactive Portfolio"
                  description="A canvas-based portfolio with draggable panels and easter eggs"
                  tags={["React", "Three.js", "Framer Motion"]}
                  image="/portfolio.png?height=120&width=200"
                />
                <ProjectCard
                  title="AI Chat Interface"
                  description="A modern chat interface with AI-powered responses"
                  tags={["Next.js", "OpenAI", "Tailwind"]}
                  image="/placeholder.svg?height=120&width=200"
                />
                <ProjectCard
                  title="E-commerce Dashboard"
                  description="Admin dashboard for managing products and orders"
                  tags={["TypeScript", "Redux", "Material UI"]}
                  image="/placeholder.svg?height=120&width=200"
                />
              </div>
            </div>
          </div>
        )}

        {panels.resume.active && (
          <div className="w-full border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h3 className="font-medium">Message Constellation</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => closePanel("resume")}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[600px]">
              <Sandbox />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen w-full transition-colors duration-300")}>
      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={cn(
          "relative w-full h-screen transition-all duration-500 z-0",
          isMobileView ? "overflow-y-auto p-2" : "p-4 md:p-8 grid-snap-background",
        )}
      >
        {/* Header Controls */}
        <div className="absolute top-4 left-4 z-[9999] flex items-center gap-2">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border">
            <span className="text-sm font-medium">Press / for ?</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 z-[9999]">
          {!isMobileView && (
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

        {showDock && !isMobileView && (
          <Dock
            onOpenPanel={togglePanel}
            activePanels={Object.entries(panels)
              .filter(([_, state]) => state.active)
              .map(([key]) => key as PanelType)}
          />
        )}

        {isMobileView ? (
          renderMobilePanels()
        ) : (
          <div className="relative w-full h-full">
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
              >
                <div className="grid grid-cols-1 gap-4 p-4 overflow-y-auto max-h-[calc(100%-3rem)] hide-scrollbar">
                  <ProjectCard
                    title="Interactive Portfolio"
                    description="A canvas-based portfolio with draggable panels and Command Terminal"
                    tags={["Next.js", "Framer Motion", "Tailwind"]}
                    image="/portfolio.png?height=120&width=200"
                  />
                  <ProjectCard
                    title="EV Rental Website"
                    description="EV rental system with secure KYC, real-time tracking, and automated payments."
                    tags={[ "React", "Tailwind"]}
                    image="/erental.png?height=120&width=200"
                  />
                  <ProjectCard
                    title="Excalidraw Clone"
                    description="A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style."
                    tags={["TypeScript", "Next.js", "Tailwind", "Prisma"]}
                    image="/excalidraw.png?height=120&width=200"
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
                className="border-4 border-card"
              >
                <Sandbox />
              </Panel>
            )}

            {/* Utility Panels */}
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
              >
                <AchievementsCard />
              </Panel>
            )}
          </div>
        )}

        <CommandBar open={showCommandBar} onOpenChange={setShowCommandBar} onExecuteCommand={executeCommand} />
      </div>
    </div>
  )
}