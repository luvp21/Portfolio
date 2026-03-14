"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { EXPERIENCE } from "@/lib/data"

export function ExperienceTimeline() {
  return (
    <div className="space-y-4 p-2 hide-scrollbar">
      {EXPERIENCE.map((exp) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: exp.id * 0.1 }}
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

          {/* expandedItems.includes(exp.id) && */}

          {(
            <motion.div
              className="px-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <p className="mb-3 text-md text-muted-foreground">{exp.description}</p>
              <div className="flex flex-wrap gap-1">
                {exp.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
