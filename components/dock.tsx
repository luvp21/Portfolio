"use client"

import type React from "react"

import { motion } from "framer-motion"
import { User, Briefcase, History, FileText, Layers, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type PanelType = "about" | "projects" | "experience" | "message" | "stack" | "achievements"

interface DockProps {
  onOpenPanel: (panel: PanelType) => void
  activePanels: PanelType[]
  onMinimizePanel?: (panel: PanelType) => void
  minimizedPanels?: PanelType[]
}

const DOCK_ITEMS: {
  panel: PanelType
  icon: React.ElementType
  label: string
  shortcut?: string
}[] = [
  { panel: "about", icon: User, label: "About" },
  { panel: "projects", icon: Briefcase, label: "Projects" },
  { panel: "experience", icon: History, label: "Experience" },
  { panel: "message", icon: FileText, label: "Message Constellation" },
  { panel: "achievements", icon: Award, label: "Achievements" },
  { panel: "stack", icon: Layers, label: "Tech Stack" },
]

export function Dock({ onOpenPanel, activePanels }: DockProps) {
  return (
    <motion.div
      className=" left-0 right-0 mx-auto z-[9999] flex justify-center"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-background backdrop-blur-lg border border-muted/30 rounded-full shadow-lg px-4 py-2 mb-2 hide-scrollbar max-w-full">
        <TooltipProvider>
          <div className="flex items-center gap-2 min-w-max">
            {DOCK_ITEMS.map(({ panel, icon: Icon, label, shortcut }) => (
              <Tooltip key={panel} delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activePanels.includes(panel) ? "default" : "ghost"}
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => onOpenPanel(panel)}
                    aria-label={`Open ${label} panel`}
                    aria-pressed={activePanels.includes(panel)}
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </motion.div>
  )
}