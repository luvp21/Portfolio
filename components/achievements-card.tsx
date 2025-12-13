"use client"

import { motion } from "framer-motion"
import { Award, Star, Trophy, Medal, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Achievement {
  id: string
  title: string
  description: string
  icon: "award" | "star" | "trophy" | "medal" | "sparkles"
  date?: string
}

export function AchievementsCard() {
  const achievements: Achievement[] = [
    {
      id: "1",
      title: "Hackathon Winner",
      description: "1st place at Breach FinTech hackathon (at PDEU) with an AI-powered EV rental system.",
      icon: "trophy",
      date: "May 2025",
    },
    {
      id: "2",
      title: "LeetCode",
      description: "Solved 100+ problems on LeetCode, building strong DSA fundamentals.",
      icon: "award",
    },
    {
      id: "3",
      title: "Codeforces",
      description: "Reached Pupil rank and solved 250+ problems on Codeforces.",
      icon: "star",
    }
  ]

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
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            className="px-2 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-2 rounded-full bg-primary/10 text-name">
              {getIcon(achievement.icon)}
            </div>
            <div className="flex-1">
              <div className="text-lg flex items-center gap-2 font-bold">
                {achievement.title}
                {achievement.date && (
                  <Badge variant="outline" className="text-xs">
                    {achievement.date}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
