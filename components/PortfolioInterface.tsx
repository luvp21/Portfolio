// components/PortfolioInterface.tsx
"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
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

const DESIGN_CANVAS_WIDTH = 1440
const DESIGN_CANVAS_HEIGHT = 670

// Compute panel dimensions that scale proportionally with the canvas.
// Reference canvas: 1440 × 810 (a typical 1080p desktop minus chrome).
const getDefaultPanelDimensions = (
    canvasW: number,
    canvasH: number,
): Record<PanelType, PanelDimensions> => {
    const scale = Math.min(1, canvasW / 1440, canvasH / 810)
    const s = (base: number, min: number) => Math.max(min, Math.round(base * scale))
    return {
        about: { width: s(450, 340), height: s(340, 280) },
        projects: { width: s(900, 790), height: s(660, 520) },
        experience: { width: s(500, 400), height: s(580, 450) },
        message: { width: s(800, 560), height: s(500, 380) },
        stack: { width: s(450, 340), height: s(330, 270) },
        achievements: { width: s(500, 390), height: s(350, 290) },
    }
}

const createDefaultPanelState = (
    viewportWidth: number,
    viewportHeight: number,
    dims: Record<PanelType, PanelDimensions>,
): Record<PanelType, PanelState> => {
    const centerX = viewportWidth / 2
    const centerY = viewportHeight / 2

    // Small proportional offsets so panels don't stack exactly on top of each other
    const ox = Math.round(viewportWidth * 0.03)   // ~3 % of canvas width
    const oy = Math.round(viewportHeight * 0.04)  // ~4 % of canvas height

    const positions = {
        about: { x: centerX - dims.about.width / 2, y: centerY - dims.about.height / 2 },
        projects: { x: centerX - dims.projects.width / 2 + ox, y: centerY - dims.projects.height / 2 - oy },
        experience: { x: centerX - dims.experience.width / 2 - ox, y: centerY - dims.experience.height / 2 },
        message: { x: centerX - dims.message.width / 2, y: centerY - dims.message.height / 2 - oy },
        stack: { x: centerX - dims.stack.width / 2 - ox, y: centerY - dims.stack.height / 2 - oy },
        achievements: { x: centerX - dims.achievements.width / 2 + ox, y: centerY - dims.achievements.height / 2 - oy },
    }

    Object.keys(positions).forEach((key) => {
        const panelType = key as PanelType
        const d = dims[panelType]
        const pos = positions[panelType]

        pos.x = Math.max(0, Math.min(pos.x, viewportWidth - d.width))
        pos.y = Math.max(0, Math.min(pos.y, viewportHeight - d.height))
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
    dims: Record<PanelType, PanelDimensions>,
): Record<PanelType, PanelState> => {
    const updatedPanels = { ...panels }

    Object.entries(updatedPanels).forEach(([key, panel]) => {
        const panelType = key as PanelType
        const d = dims[panelType]

        const maxX = Math.max(0, viewportWidth - d.width)
        panel.position.x = Math.max(0, Math.min(panel.position.x, maxX))

        const maxY = Math.max(0, viewportHeight - d.height)
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
    const canvasHostRef = useRef<HTMLDivElement | null>(null)
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
    const [canvasScale, setCanvasScale] = useState(1)

    // Panel dimensions scale with the actual canvas size
    const panelDimensions = useMemo(() => {
        const vw = viewportSize.width || (typeof window !== "undefined" ? window.innerWidth : 1440)
        const vh = viewportSize.height || (typeof window !== "undefined" ? window.innerHeight : 810)
        return getDefaultPanelDimensions(vw, vh)
    }, [viewportSize])

    // Lazy initialize panels so mobile gets active panels on first client render
    const [panels, setPanels] = useState<Record<PanelType, PanelState>>(() => {
        if (typeof window !== "undefined") {
            const vw = window.innerWidth
            const vh = window.innerHeight
            const dims = getDefaultPanelDimensions(vw, vh)
            const initial = createDefaultPanelState(vw, vh, dims)

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

    // Scale whole desktop canvas up/down based on available space
    useEffect(() => {
        if (isMobile) return

        const updateScale = () => {
            const host = canvasHostRef.current
            if (!host) return
            const rect = host.getBoundingClientRect()
            const sx = rect.width / DESIGN_CANVAS_WIDTH
            const sy = rect.height / DESIGN_CANVAS_HEIGHT
            const scale = Math.max(0.4, Math.min(sx, sy))
            setCanvasScale(scale)
        }

        updateScale()
        window.addEventListener("resize", updateScale)
        return () => window.removeEventListener("resize", updateScale)
    }, [isMobile])

    // Initializer effect: loads saved desktop positions, but NEVER overwrites mobile initial active panels
    useEffect(() => {
        if (isInitialized) return

        const vw = isMobile
            ? (typeof window !== "undefined" ? window.innerWidth : 1024)
            : DESIGN_CANVAS_WIDTH
        const vh = isMobile
            ? (typeof window !== "undefined" ? window.innerHeight : 768)
            : DESIGN_CANVAS_HEIGHT
        setViewportSize({ width: vw, height: vh })

        const dims = getDefaultPanelDimensions(vw, vh)

        if (vw < 768) {
            const initialPanels = createDefaultPanelState(vw, vh, dims)
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
                const constrained = constrainPanelsToViewport(savedPanels, vw, vh, dims)
                setPanels(constrained)
            } else {
                setPanels(createDefaultPanelState(vw, vh, dims))
            }
        } catch (e) {
            console.error("Error loading saved panels:", e)
            setPanels(createDefaultPanelState(vw, vh, dims))
        }

        setIsInitialized(true)
    }, [isInitialized, resetKey, isMobile])

    // If user switches to mobile after initialization, force-activate panels and ignore saved
    useEffect(() => {
        if (!isInitialized) return
        if (!isMobile) return

        const vw = typeof window !== "undefined" ? window.innerWidth : viewportSize.width || 375
        const vh = typeof window !== "undefined" ? window.innerHeight : viewportSize.height || 667
        const dims = getDefaultPanelDimensions(vw, vh)
        const initialPanels = createDefaultPanelState(vw, vh, dims)
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
            if (!isMobile) {
                setViewportSize({ width: DESIGN_CANVAS_WIDTH, height: DESIGN_CANVAS_HEIGHT })
                return
            }

            const vw = window.innerWidth
            const vh = window.innerHeight
            setViewportSize({ width: vw, height: vh })

            if (isInitialized && Object.keys(panels).length > 0) {
                const dims = getDefaultPanelDimensions(vw, vh)
                setPanels(prev => constrainPanelsToViewport(prev, vw, vh, dims))
            }
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [isInitialized, panels, isMobile])

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
        const d = panelDimensions[panel]
        const vw = viewportSize.width || (typeof window !== "undefined" ? window.innerWidth : d.width)
        const vh = viewportSize.height || (typeof window !== "undefined" ? window.innerHeight : d.height)
        const constrainedX = Math.max(0, Math.min(x, vw - d.width))
        const constrainedY = Math.max(0, Math.min(y, vh - d.height))

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
                const vw = viewportSize.width || window.innerWidth
                const vh = viewportSize.height || window.innerHeight
                const dims = getDefaultPanelDimensions(vw, vh)
                const defaultPositions = createDefaultPanelState(vw, vh, dims)

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
            <header className="flex-none h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-4 z-[9999]">
                {/* Left slot */}
                {!isMobile ? (
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
                ) : <div />}

                {/* Right slot */}
                <div className="flex items-center gap-2">
                    {!isMobile && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={resetPanelPositions}
                            className="rounded-full flex items-center justify-center border border-border/20 p-2"
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
                {/* Mobile vs Desktop */}
                {isMobile ? (
                    <MobileLayout panels={panels} theme={theme} />
                ) : (
                    <div ref={canvasHostRef} className="absolute inset-0 flex items-start justify-center overflow-auto">
                        <div
                            key={`canvas-container-${resetKey}`}
                            ref={canvasRef}
                            className="relative rounded-lg"
                            style={{
                                width: DESIGN_CANVAS_WIDTH,
                                height: DESIGN_CANVAS_HEIGHT,
                                transform: `scale(${canvasScale})`,
                                transformOrigin: "top center",
                            }}
                        >
                            {/* Pixelated Banner — inside canvas so it respects max-w/max-h */}
                            <PixelatedBanner
                                isBlurred={isInitialized && Object.values(panels).some(panel => panel.active)}
                            />
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
                                DEFAULT_PANEL_DIMENSIONS={panelDimensions}
                                canvasScale={canvasScale}
                            />
                        </div>
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
                <footer className="flex-none bg-background/80 backdrop-blur-sm border-t border-border py-2">
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
