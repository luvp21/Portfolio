"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Building2, Briefcase, GraduationCap} from "lucide-react"

interface ExperienceItem {
  id: number
  title: string
  company: string
  period: string
  description: string
  skills: string[]
  icon: "company" | "education" | "freelance" | "organization"}

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
        "Developed CSI Nirma’s official websit.",
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
      period: "2024 – 2027",
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
          className="border rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: exp.id * 0.1 }}
        >
          <div
            className="flex items-center justify-between p-4  bg-muted/30"
            /* onClick={() => toggleExpand(exp.id)} */
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-name">{getIcon(exp.icon)}</div>
              <div>
                <h3 className="text-lg text-name">{exp.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {exp.company} • {exp.period}
                </p>
              </div>
            </div>
            {/*
            <Button variant="ghost" size="icon">
              {expandedItems.includes(exp.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            */}
          </div>
          
          {/* expandedItems.includes(exp.id) && */}
          
          { (
            <motion.div
              className="p-4 border-t"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <p className="mb-3 text-md">{exp.description}</p>
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
