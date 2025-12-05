"use client"

import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiGit,
  SiNodedotjs,
  SiHtml5,
  SiSupabase,
} from "react-icons/si"

const technologies = [
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "currentColor" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38BDF8" },
  { name: "Git", icon: SiGit, color: "#F05032" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "HTML5", icon: SiHtml5, color: "#E34F26" },
  { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
]

export function TechStack() {

  return (
    <div className="grid grid-cols-4 gap-2 p-2 max-w-xl mx-auto">
      {technologies.map((tech) => {
        const Icon = tech.icon

        return (
          <div
            key={tech.name}
            className="relative flex flex-col items-center gap-2 px-2 py-4 transition-all "
          >
            <Icon
              className="text-[36px] z-10"
              style={{
                color: tech.name === "Next.js" ? "var(--foreground)" : tech.color,
              }}
            />
            <p className="z-10 text-sm text-foreground">{tech.name}</p>
          </div>
        )
      })}
    </div>
  )
}
