"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  image: string
  githubUrl?: string
  liveUrl?: string
}

export function ProjectCard({ title, description, tags, image, githubUrl, liveUrl }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="rounded-lg overflow-hidden border bg-card text-card-foreground shadow-sm"
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-32 object-cover transition-transform duration-300"
          style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          {githubUrl && (
            <Button variant="outline" size="sm" className="w-full">
              <Github className="mr-1 h-3 w-3" />
              Code
            </Button>
          )}
          {liveUrl && (
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="mr-1 h-3 w-3" />
              Demo
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
