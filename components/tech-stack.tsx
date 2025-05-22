"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiGit,
  SiNodedotjs,
  SiHtml5,
  SiSupabase
} from "react-icons/si"

const technologies = [
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#fff" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38BDF8" },
  { name: "Git", icon: SiGit, color: "#F05032" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "HTML5", icon: SiHtml5, color: "#E34F26" },
  { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
]

export function TechStack() {
  const [selected, setSelected] = useState("")

  return (
    <div className="grid grid-cols-4 gap-4 p-4 max-w-xl mx-auto">
      {technologies.map((tech) => {
        const Icon = tech.icon
        const isSelected = selected === tech.name

        return (
          <motion.button
            key={tech.name}
            onClick={() => setSelected(tech.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-6 transition-all hover:bg-zinc-800 ${
              isSelected ? "bg-zinc-900 border-white/20" : ""
            }`}
          >
            {isSelected && (
              <motion.span
                layoutId="outline"
                className="absolute inset-0 rounded-xl border-2 border-violet-500"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <Icon className="text-[28px] z-10" style={{ color: tech.color }} />
            <p className="z-10 text-sm text-white">{tech.name}</p>
          </motion.button>
        )
      })}
    </div>
  )
}