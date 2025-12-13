// components/MobileLayout.tsx
import React from "react"
import { User, Briefcase, History, FileText, Layers, Award } from "lucide-react"
import { cn } from "@/lib/utils"

import { ProfileCard } from "@/components/profile-card"
import { ProjectCard } from "@/components/project-card"
import { TechStack } from "@/components/tech-stack"
import { AchievementsCard } from "@/components/achievements-card"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { Sandbox } from "@/components/Sandbox"
import type { PanelType, PanelState } from "./types"

interface MobileLayoutProps {
    panels: Record<PanelType, PanelState>
    theme: string
}

export function MobileLayout({ panels, theme }: MobileLayoutProps) {
    const renderMobilePanel = (
        panelType: PanelType,
        title: string,
        icon: React.ReactNode,
        children: React.ReactNode,
        maxHeight?: string,
    ) => {
        if (!panels[panelType]?.active) return null

        return (
            <div key={panelType} className="w-full border rounded-lg shadow-sm mb-4 bg-card hide-scrollbar">
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
        <div className={cn("h-full overflow-y-auto hide-scrollbar", theme === "dark" ? "mobile-grid-dark" : "mobile-grid-light")}>
            <div className="min-h-full pt-4 pb-20 space-y-4 px-3">
                {renderMobilePanel("about", "About Me", <User className="h-4 w-4" />, <ProfileCard />, "500px")}
                {renderMobilePanel("stack", "Tech Stack", <Layers className="h-4 w-4" />, <TechStack />, "500px")}
                {renderMobilePanel("achievements", "Achievements", <Award className="h-4 w-4" />, <AchievementsCard />, "500px")}
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
    )
}
