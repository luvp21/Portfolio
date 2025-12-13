// components/PortfolioInterface.tsx
"use client"

import React, { useEffect, useState, useRef } from "react"
import { User, Briefcase, History, RotateCcw, FileText, Layers, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { CommandBar } from "@/components/command-bar"
import { Dock } from "@/components/dock"
import { PixelatedBanner } from "@/components/pixelated-banner"
import { ThemeToggleButton } from "@/components/theme-toggle"
import { LiveVisitorBadge } from "./LiveVisitorBadge"
import { MobileLayout } from "@/components/MobileLayout"
import { DesktopCanvas } from "@/components/DesktopCanvas"
import type { PanelType, PanelState, PanelDimensions } from "./types"

// default panel dimensions (same as before)
const DEFAULT_PANEL_DIMENSIONS: Record<PanelType, PanelDimensions> = {
    about: { width: 450, height: 300 },
    projects: { width: 500, height: 600 },
    experience: { width: 470, height: 550 },
    message: { width: 800, height: 500 },
    stack: { width: 450, height: 270 },
    achievements: { width: 450, height: 300 },
}

// createDefaultPanelState and constrainPanelsToViewport are same as before:
const createDefaultPanelState = (
    viewportWidth: number,
    viewportHeight: number,
): Record<PanelType, PanelState> => {
    const centerX = viewportWidth / 2
    const centerY = viewportHeight / 2

    const positions = {
        about: { x: centerX - DEFAULT_PANEL_DIMENSIONS.about.width / 2, y: centerY - DEFAULT_PANEL_DIMENSIONS.about.height / 2 },
        projects: { x: centerX - DEFAULT_PANEL_DIMENSIONS.projects.width / 2 + 50, y: centerY - DEFAULT_PANEL_DIMENSIONS.projects.height / 2 - 50 },
        experience: { x: centerX - DEFAULT_PANEL_DIMENSIONS.experience.width / 2 - 100, y: centerY - DEFAULT_PANEL_DIMENSIONS.experience.height / 2 },
        message: { x: centerX - DEFAULT_PANEL_DIMENSIONS.message.width / 2, y: centerY - DEFAULT_PANEL_DIMENSIONS.message.height / 2 - 60 },
        stack: { x: centerX - DEFAULT_PANEL_DIMENSIONS.stack.width / 2 - 50, y: centerY - DEFAULT_PANEL_DIMENSIONS.stack.height / 2 - 50 },
        achievements: { x: centerX - DEFAULT_PANEL_DIMENSIONS.achievements.width / 2 + 50, y: centerY - DEFAULT_PANEL_DIMENSIONS.achievements.height / 2 - 50 },
    }

    Object.keys(positions).forEach((key) => {
        const panelType = key as PanelType
        const dimensions = DEFAULT_PANEL_DIMENSIONS[panelType]
        const pos = positions[panelType]

        pos.x = Math.max(0, Math.min(pos.x, viewportWidth - dimensions.width))
        pos.y = Math.max(0, Math.min(pos.y, viewportHeight - dimensions.height))
    })

    return {
        about: { active: false, position: positions.about, minimized: false, zIndex: 1, pinned: false },
        projects: { active: false, position: positions.projects, minimized: false, zIndex: 1, pinned: false },
        experience: { active: false, position: positions.experience, minimized: false, zIndex: 1, pinned: false },
        message: { active: false, position: positions.message, minimized: false, zIndex: 1, pinned: false },
        stack: { active: false, position: positions.stack, minimized: false, zIndex: 1, pinned: false },
        achievements: { active: false, position: positions.achievements, minimized: false, zIndex: 1, pinned: false },
    }
}

const constrainPanelsToViewport = (
    panels: Record<PanelType, PanelState>,
    viewportWidth: number,
    viewportHeight: number,
): Record<PanelType, PanelState> => {
    const updatedPanels = { ...panels }

    Object.entries(updatedPanels).forEach(([key, panel]) => {
        const panelType = key as PanelType
        const dimensions = DEFAULT_PANEL_DIMENSIONS[panelType]

        const maxX = viewportWidth - dimensions.width
        panel.position.x = Math.max(0, Math.min(panel.position.x, maxX))

        const maxY = viewportHeight - dimensions.height
        panel.position.y = Math.max(0, Math.min(panel.position.y, maxY))
    })

    return updatedPanels
}

// Simple responsive hook (client-only)
function useResponsive() {
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)

    useEffect(() => {
        const checkResponsive = () => {
            const width = typeof window !== "undefined" ? window.innerWidth : 1024
            setIsMobile(width < 768)
            setIsTablet(width >= 768 && width < 1024)
        }

        checkResponsive()
        window.addEventListener("resize", checkResponsive)
        return () => window.removeEventListener("resize", checkResponsive)
    }, [])

    return { isMobile, isTablet, isDesktop: !isMobile && !isTablet }
}

export default function PortfolioInterface() {
    const [showCommandBar, setShowCommandBar] = useState(false)
    const [highestZIndex, setHighestZIndex] = useState(1)
    const { isMobile } = useResponsive()
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

    // Lazy initialize panels so mobile gets active panels on first client render
    const [panels, setPanels] = useState<Record<PanelType, PanelState>>(() => {
        if (typeof window !== "undefined") {
            const vw = window.innerWidth
            const vh = window.innerHeight
            const initial = createDefaultPanelState(vw, vh)

            if (vw < 768) {
                Object.keys(initial).forEach((k) => {
                    const p = k as PanelType
                    initial[p] = { ...initial[p], active: true, minimized: false }
                })
            }

            return initial
        }

        return {} as Record<PanelType, PanelState>
    })

    const [isInitialized, setIsInitialized] = useState(false)
    const [resetKey, setResetKey] = useState(0)

    const { setTheme, theme } = useTheme()

    // Initializer effect: loads saved desktop positions, but NEVER overwrites mobile initial active panels
    useEffect(() => {
        if (isInitialized) return

        const rect = canvasRef.current?.getBoundingClientRect()
        const vw = rect ? rect.width : (typeof window !== "undefined" ? window.innerWidth : 1024)
        const vh = rect ? rect.height : (typeof window !== "undefined" ? window.innerHeight : 768)
        setViewportSize({ width: vw, height: vh })

        if (vw < 768) {
            const initialPanels = createDefaultPanelState(vw, vh)
            Object.keys(initialPanels).forEach((k) => {
                const p = k as PanelType
                initialPanels[p] = { ...initialPanels[p], active: true, minimized: false }
            })
            setPanels(initialPanels)
            setIsInitialized(true)
            return
        }

        try {
            const saved = localStorage.getItem("portfolioPanels")
            if (saved) {
                const savedPanels = JSON.parse(saved)
                const constrained = constrainPanelsToViewport(savedPanels, vw, vh)
                setPanels(constrained)
            } else {
                setPanels(createDefaultPanelState(vw, vh))
            }
        } catch (e) {
            console.error("Error loading saved panels:", e)
            setPanels(createDefaultPanelState(vw, vh))
        }

        setIsInitialized(true)
    }, [isInitialized, resetKey])

    // If user switches to mobile after initialization, force-activate panels and ignore saved
    useEffect(() => {
        if (!isInitialized) return
        if (!isMobile) return

        const vw = typeof window !== "undefined" ? window.innerWidth : viewportSize.width || 375
        const vh = typeof window !== "undefined" ? window.innerHeight : viewportSize.height || 667
        const initialPanels = createDefaultPanelState(vw, vh)
        Object.keys(initialPanels).forEach((k) => {
            const p = k as PanelType
            initialPanels[p] = { ...initialPanels[p], active: true, minimized: false }
        })
        setPanels(initialPanels)
        setViewportSize({ width: vw, height: vh })
    }, [isMobile, isInitialized])

    // Update viewport size on window resize (and constrain panels)
    useEffect(() => {
        const handleResize = () => {
            const rect = canvasRef.current?.getBoundingClientRect()
            const vw = rect ? rect.width : window.innerWidth
            const vh = rect ? rect.height : window.innerHeight
            setViewportSize({ width: vw, height: vh })

            if (isInitialized && Object.keys(panels).length > 0) {
                setPanels(prev => constrainPanelsToViewport(prev, vw, vh))
            }
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [isInitialized, panels])

    // Save positions when they change (desktop only)
    useEffect(() => {
        if (isInitialized && !isMobile && Object.keys(panels).length > 0) {
            try {
                localStorage.setItem("portfolioPanels", JSON.stringify(panels))
            } catch (e) {
                console.error("Could not save panels to localStorage", e)
            }
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
        try {
            localStorage.removeItem("portfolioPanels")
        } catch (e) {
            console.error("Could not remove portfolioPanels", e)
        }
        setHighestZIndex(1)
        setIsInitialized(false)
        setResetKey((prev) => prev + 1)
    }

    const updatePanelPosition = (panel: PanelType, x: number, y: number) => {
        const dimensions = DEFAULT_PANEL_DIMENSIONS[panel]
        const vw = viewportSize.width || (typeof window !== "undefined" ? window.innerWidth : dimensions.width)
        const vh = viewportSize.height || (typeof window !== "undefined" ? window.innerHeight : dimensions.height)
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
            const isOpening = !prev[panel]?.active

            if (isOpening) {
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
                    active: !prev[panel]?.active,
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

    return (
        <div className="h-screen w-full transition-colors duration-300 flex flex-col">
            {/* Header */}
            <header className={`flex-none h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isMobile ? "border-b" : ""}`}>
                {!isMobile && (
                    <div className="absolute inset-y-0 left-4 z-[9999] flex items-center gap-2">
                        <button
                            onClick={() => setShowCommandBar(true)}
                            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border cursor-pointer text-sm hover:bg-background/90 transition-colors group"
                            aria-label="Open command bar"
                            aria-describedby="command-bar-help"
                        >
                            <kbd className="px-1.5 py-0.5 rounded bg-foreground/10 dark:bg-foreground/5 border border-foreground/20 dark:border-foreground/10 font-mono text-xs font-semibold group-hover:bg-foreground/15 transition-colors">
                                /
                            </kbd>
                            <span>Command Bar</span>
                        </button>
                    </div>
                )}

                <div className="absolute inset-y-0 right-4 flex items-center gap-2 z-[9999]">
                    {!isMobile && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={resetPanelPositions}
                            className="rounded-full relative group flex items-center justify-center border border-border/20 p-2"
                            aria-label="Reset panels"
                            title="Reset panels"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}

                    <ThemeToggleButton
                        className="rounded-full flex items-center justify-center border border-border/20 p-2"
                        variant="circle"
                        start="top-right"
                    />
                </div>
            </header>

            {/* Canvas Area */}
            <div className="relative flex-1 overflow-hidden">
                {/* Pixelated Banner only on desktop */}
                {!isMobile && (
                    <PixelatedBanner
                        isHidden={isInitialized && Object.values(panels).some(panel => panel.active)}
                        className="z-[9999]"
                    />
                )}

                {/* Mobile vs Desktop */}
                {isMobile ? (
                    <MobileLayout panels={panels} theme={theme} />
                ) : (
                    <div key={`canvas-container-${resetKey}`} ref={canvasRef} className="absolute w-full h-full grid-snap-background rounded-lg">
                        <DesktopCanvas
                            panels={panels}
                            viewportSize={viewportSize}
                            isInitialized={isInitialized}
                            resetKey={resetKey}
                            updatePanelPosition={updatePanelPosition}
                            closePanel={closePanel}
                            minimizePanel={minimizePanel}
                            bringToFront={bringToFront}
                            togglePinPanel={togglePinPanel}
                            DEFAULT_PANEL_DIMENSIONS={DEFAULT_PANEL_DIMENSIONS}
                        />
                    </div>
                )}

                {/* Command Bar */}
                <CommandBar open={showCommandBar} onOpenChange={setShowCommandBar} onExecuteCommand={executeCommand} />
            </div>

            {/* Footer */}
            {isMobile ? (
                <div className="bg-background/80 backdrop-blur-sm border-border/20 pt-3 border-t border-b">
                    <div className="h-full px-4">
                        <div className="text-sm text-muted-foreground/70">
              // Built with Next.js, Tailwind, and Supabase; <span className="text-blue-400">thanks()</span>;
                        </div>
                    </div>
                </div>
            ) : (
                <footer className="flex-none bg-background/80 backdrop-blur-sm border-border/20 py-2">
                    <div className="px-8 flex items-center">
                        <div className="flex-1 text-md text-muted-foreground/70">
              // Built with Next.js, Tailwind, and Supabase; <span className="text-blue-400">thanks()</span>;
                        </div>

                        <div className="flex-1 flex items-center justify-center z-[9999]">
                            <Dock
                                onOpenPanel={togglePanel}
                                activePanels={Object.entries(panels)
                                    .filter(([_, state]) => state.active)
                                    .map(([key]) => key as PanelType)}
                            />
                        </div>


                        <div className="flex-1 flex items-center justify-end text-md text-muted-foreground/70">
                            <LiveVisitorBadge incrementOnMount={true} />
                        </div>
                    </div>
                </footer>
            )}
        </div>
    )
}
