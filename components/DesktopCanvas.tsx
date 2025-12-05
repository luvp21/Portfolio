// components/DesktopCanvas.tsx
import React from "react"
import type { PanelType, PanelState, PanelDimensions } from "./types"
import { Panel } from "@/components/panel"
import { User, Briefcase, History, FileText, Layers, Award } from "lucide-react"

import { ProfileCard } from "@/components/profile-card"
import { ProjectCard } from "@/components/project-card"
import { TechStack } from "@/components/tech-stack"
import { AchievementsCard } from "@/components/achievements-card"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { Sandbox } from "@/components/Sandbox"

interface DesktopCanvasProps {
    panels: Record<PanelType, PanelState>
    viewportSize: { width: number; height: number }
    isInitialized: boolean
    resetKey: number
    updatePanelPosition: (panel: PanelType, x: number, y: number) => void
    closePanel: (panel: PanelType) => void
    minimizePanel: (panel: PanelType) => void
    bringToFront: (panel: PanelType) => void
    togglePinPanel: (panel: PanelType, isPinned: boolean) => void
    DEFAULT_PANEL_DIMENSIONS: Record<PanelType, PanelDimensions>
}

export function DesktopCanvas({
    panels,
    viewportSize,
    isInitialized,
    resetKey,
    updatePanelPosition,
    closePanel,
    minimizePanel,
    bringToFront,
    togglePinPanel,
    DEFAULT_PANEL_DIMENSIONS,
}: DesktopCanvasProps) {
    return (
        <>
            {isInitialized &&
                viewportSize.width > 0 &&
                viewportSize.height > 0 &&
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
                            canvasBoundaries={viewportSize}
                        >
                            {panelType === "about" && <ProfileCard />}

                            {panelType === "projects" && (
                                <div className="grid grid-cols-1 gap-4 p-4 overflow-y-auto max-h-[calc(100%-1rem)] hide-scrollbar">
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
        </>
    )
}
