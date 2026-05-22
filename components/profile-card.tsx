"use client"

import { motion } from "framer-motion"
import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PERSONAL, PROFILE_TAGS, PROFILE_LINKS } from "@/lib/data"

export const ProfileCard = memo(function ProfileCard() {
  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex gap-1 sm:gap-6 mt-6 lg:px-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >

        <Avatar className="w-24 h-24 group relative bg-blue-300 rounded-full shrink-0">
          <AvatarImage src={PERSONAL.avatar} alt="Profile" />
          <AvatarFallback>LP</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h2 className="text-3xl font-bold mb-1">{PERSONAL.name}</h2>

          <div className="flex gap-1">
            {PROFILE_TAGS.map((tag, index) => (
              <div key={index} className="flex items-center gap-1 py-1 rounded-full text-muted-foreground bg-muted/10">
                {tag.icon}
                <span className="text-sm font-medium">{tag.text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {PROFILE_LINKS.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1 bg-card"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      <p className="text-foreground text-md mt-6 lg:px-4 max-w-xl mx-auto leading-relaxed">
        {PERSONAL.bio}
      </p>


    </motion.div>
  )
})
