"use client"

import { useState, memo } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Github } from "lucide-react"
import { techIcons } from "@/components/tech-icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]      // → converted to icons via techIcons
  image: string
  githubUrl?: string
  liveUrl?: string
}

export const ProjectCard = memo(function ProjectCard({
  title,
  description,
  tags,
  image,
  githubUrl,
  liveUrl,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    // allow overflow so tooltips aren't clipped
    <TooltipProvider delayDuration={0}>
      <motion.div
        className="rounded-2xl overflow-visible border bg-card text-card-foreground"
      >
        {/* IMAGE */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-44 object-cover transition-all duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40" />
        </div>

        <div className="p-5">
          {/* TITLE + ICONS (GitHub / Live) */}
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>

            <div className="flex items-center gap-3">
              {githubUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-card border border-neutral-700"
                      aria-label="Open GitHub"
                    >
                      <Github className="h-4 w-4 text-foreground" />
                    </a>
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    avoidCollisions={false}
                    className="!z-[99999] pointer-events-none"
                  >
                    <p className="whitespace-nowrap">GitHub</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {liveUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-card border border-neutral-700"
                      aria-label="Open Live Demo"
                    >
                      <ExternalLink className="h-4 w-4 text-foreground" />
                    </a>
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    avoidCollisions={false}
                    className="!z-[99999] pointer-events-none"
                  >
                    <p className="whitespace-nowrap">Live Demo</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>

          {/* TECHNOLOGIES */}
          <div className="mt-5 text-sm font-medium text-muted-foreground">Technologies</div>

          <div className="mt-3 flex items-center gap-3">
            {tags.map((tag) => {
              const Icon = techIcons[tag]
              return (
                <Tooltip key={tag}>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex items-center justify-center w-[22px] h-[22px]"
                      aria-label={tag}
                    >
                      {Icon || <span className="text-xs text-muted-foreground">{tag}</span>}
                    </div>
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    avoidCollisions={false}
                    className="!z-[99999] pointer-events-none"
                  >
                    <p className="whitespace-nowrap">{tag}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
})
