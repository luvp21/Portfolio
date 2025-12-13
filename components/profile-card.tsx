"use client"

import { motion } from "framer-motion"
import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, GraduationCap, Calendar, Mail, CalendarClock, FileBadge2 } from "lucide-react"
import { FaLinkedin, FaGithub } from "react-icons/fa"

const tags = [
  { icon: <MapPin size={16} />, text: "India" },
  { icon: <GraduationCap size={16} />, text: "Undergraduate" },
  { icon: <Calendar size={16} />, text: "20y/o" },
]

const links = [
  { icon: <FaLinkedin size={20} className="text-[#0A66C2]" />, href: "https://linkedin.com/in/luvv" },
  {
    icon: (
      <>
        <img
          src="/icons/github-mark.svg"
          alt="github"
          className="w-5 h-5 object-contain dark:hidden"
        />

        <img
          src="/icons/github-mark-white.svg"
          alt="github"
          className="w-5 h-5 object-contain hidden dark:block"
        />
      </>
    ),
    href: "https://github.com/luvp21",
  },
  { icon: <Mail size={20} className="text-[#f4b267]" />, href: "mailto:luvvvpatel@gmail.com" },
  {
    icon: (
      <img
        src="/icons/leetcode.svg"
        alt="leetcode"
        className="w-5 h-5 object-contain"
      />
    ),
    href: "https://leetcode.com/u/luvv21/",
  },
  {
    icon: (
      <img
        src="/icons/cf.svg"
        alt="Codeforces"
        className="w-5 h-5 object-contain"
      />
    ),
    href: "https://codeforces.com/profile/luvv",
  },
]

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
          <AvatarImage
            src="/pp.png"
            alt="Profile"
          // className="transition-opacity duration-300 group-hover:opacity-0 object-center"
          />
          {/* <img
            src="/Luv_Patel.jpg"
            alt="Profile Hover"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
          /> */}
          <AvatarFallback>LP</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h2 className="text-3xl font-bold mb-1">Luv Patel</h2>
          {/* <p className="text-md text-muted-foreground mb-2">
            I'm a <span className="text-name">Full Stack Developer</span>
          </p> */}

          <div className="flex gap-1 ">
            {tags.map((tag, index) => (
              <div className="flex items-center gap-1 py-1 rounded-full text-muted-foreground bg-muted/10">
                {tag.icon}
                <span className="text-sm font-medium">{tag.text}</span>
              </div>
            ))}
          </div>


          <div className="flex gap-3">
            {links.map((link, index) => (
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
        I'm a Computer Science student who enjoys building web apps. I like solving problems and making things that work well.
      </p>


    </motion.div>
  )
})
