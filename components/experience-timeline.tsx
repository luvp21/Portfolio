"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Building2, Briefcase, GraduationCap } from "lucide-react"

interface ExperienceItem {
  id: number
  title: string
  company: string
  period: string
  description: string
  skills: string[]
  icon: "company" | "education" | "freelance" | "organization"
}

export function ExperienceTimeline() {
  // const [expandedItems, setExpandedItems] = useState<number[]>([1])

  const experiences: ExperienceItem[] = [
    {
      id: 1,
      title: "General Secretary",
      company: "Computer Society of India - Nirma University",
      period: " Aug 2025 – Present",
      description:
        "Managing club operations, leading teams, and overseeing events and initiatives at CSI Nirma.",
      skills: [
        "Leadership",
        "Team Management",
        "Communication"
      ],
      icon: "organization",
    },
    {
      id: 2,
      title: "Core Committee Member",
      company: "Computer Society of India - Nirma University",
      period: " Oct 2024 – Aug 2025",
      description:
        "Developed CSI Nirma’s official website.",
      skills: [
        "Node.js",
        "MongoDB",
        "Express",
        "JavaScript",
        "React",
        "Web Development",
      ],
      icon: "organization",
    },
    {
      id: 3,
      title: "B.Tech in Computer Science and Engineering",
      company: "Nirma University",
      period: "2023 – 2027",
      description:
        "Pursuing a B.Tech in Computer Science and Engineering at Nirma University.",
      skills: [
        "Data Structures and Algorithms",
        "OOP",
        "Operating System",
        "DBMS",
        "Full Stack Web Development"
      ],
      icon: "education",
    },
  ]

  // const toggleExpand = (id: number) => {
  //   setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  // }

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "company":
        return <Building2 className="h-5 w-5" />
      case "education":
        return <GraduationCap className="h-5 w-5" />
      case "freelance":
        return <Briefcase className="h-5 w-5" />
      default:
        return <Building2 className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4 p-2 hide-scrollbar">
      {experiences.map((exp) => (
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
