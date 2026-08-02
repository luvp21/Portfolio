"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Award, Star, Trophy, Medal, Sparkles, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ACHIEVEMENTS } from "@/lib/data"

export function AchievementsCard() {
  const shouldReduceMotion = useReducedMotion()

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "award":
        return <Award className="h-5 w-5" />
      case "star":
        return <Star className="h-5 w-5" />
      case "trophy":
        return <Trophy className="h-5 w-5" />
      case "medal":
        return <Medal className="h-5 w-5" />
      case "sparkles":
        return <Sparkles className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  return (
    <div className="p-2 h-full overflow-y-auto hide-scrollbar ">

      <div className="space-y-3">
        {ACHIEVEMENTS.map((achievement) => (
          <motion.div
            key={achievement.id}
            className="px-2 flex items-center gap-3"
            initial={{ opacity: 0, transform: shouldReduceMotion ? "translateY(0px)" : "translateY(20px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.3 }}
          >
            <div className="p-2 rounded-full bg-primary/10 text-name">
              {getIcon(achievement.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg flex items-center justify-between gap-4 font-bold">
                <span className="truncate">{achievement.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {achievement.date && (
                    <Badge variant="outline" className="text-xs font-semibold whitespace-nowrap">
                      {achievement.date}
                    </Badge>
                  )}
                  {achievement.certificateUrl && (
                    <a
                      href={achievement.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors pointer-events-auto whitespace-nowrap"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      <span>Certificate</span>
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{achievement.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
