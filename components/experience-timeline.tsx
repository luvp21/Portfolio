"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { EXPERIENCE } from "@/lib/data"

export function ExperienceTimeline() {
  const shouldReduceMotion = useReducedMotion()
  return (
    <div className="space-y-4 p-2 hide-scrollbar">
      {EXPERIENCE.map((exp) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, transform: shouldReduceMotion ? "translateY(0px)" : "translateY(20px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ delay: shouldReduceMotion ? 0 : exp.id * 0.05 }}
          className="py-1"
        >
          <div className="flex items-center justify-between px-4 bg-muted/30">
            <div className="flex items-start w-full">
              <div className="flex flex-col w-full">

                <div className="flex w-full items-baseline justify-between">
                  <h3 className="text-xl font-bold">{exp.title}</h3>
                  <span className="text-md font-bold whitespace-nowrap">{exp.period}</span>
                </div>

                <p className="text-md text-primary">{exp.company}</p>
              </div>
            </div>
          </div>

          <div className="px-4">
            <p className="mb-3 text-md text-muted-foreground">{exp.description}</p>
            <div className="flex flex-wrap gap-1">
              {exp.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
