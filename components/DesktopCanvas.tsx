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
import { PROJECTS } from "@/lib/data"

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
    canvasScale: number
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
    canvasScale,
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
                            canvasScale={canvasScale}
                        >
                            {panelType === "about" && <ProfileCard />}

                            {panelType === "projects" && (
                                <div className="grid grid-cols-2 gap-4 p-4 overflow-y-auto max-h-[calc(100%-1rem)] hide-scrollbar">
                                    {PROJECTS.map((project) => (
                                        <ProjectCard key={project.title} {...project} />
                                    ))}
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
