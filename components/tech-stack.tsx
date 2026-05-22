"use client"

import { TECH_STACK } from "@/lib/data"

export function TechStack() {

  return (
    <div className="grid grid-cols-4 gap-2 p-2 max-w-xl mx-auto">
      {TECH_STACK.map((tech) => {
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
