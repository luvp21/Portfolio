"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Moon,
  Sun,
  RotateCcw,
  User,
  Briefcase,
  History,
  Mail,
  FileText,
  Award,
  Layers,
  Code,
  Github,
  Linkedin,
  Twitter,
  Download,
  MessageSquare,
  Star,
  Send,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/components/theme-provider"

interface CommandBarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExecuteCommand: (command: string) => void
}

export function CommandBar({ open, onOpenChange, onExecuteCommand }: CommandBarProps) {
  const [inputValue, setInputValue] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [mouseActive, setMouseActive] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const menuScrollRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const mouseMoveTimerRef = useRef<number | null>(null)
  const { theme } = useTheme()

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Command groups
  const navigationCommands = ["about", "projects", "experience", "achievements", "stack", "Message"]
  const appearanceCommands = ["dark", "light"]
  const toolsCommands = ["reset"]
  const socialCommands = ["github", "linkedin", "twitter", "email"]
  const systemCommands = ["close", "downloadcv"]

  const allCommands = [
    ...navigationCommands,
    ...appearanceCommands,
    ...toolsCommands,
    ...socialCommands,
    ...systemCommands,
  ]

  // Descriptions
  const commandDescriptions: Record<string, string> = {
    about: "Open/Close the About Me panel",
    projects: "Open/Close the Projects panel",
    experience: "Open/Close the Experience panel",
    Message: "Open/Close the Message Constellation panel",
    skills: "View my technical skills",
    dark: "Switch to dark mode",
    light: "Switch to light mode",
    achievements: "Open/Close the Achievements panel",
    stack: "Open/Close the Tech Stack panel",
    reset: "Reset panel positions",
    github: "Visit my GitHub profile",
    linkedin: "Connect with me on LinkedIn",
    twitter: "Follow me on Twitter",
    email: "Send me an email",
    close: "Close the command terminal",
    downloadcv: "Download my resume/CV",
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setInputValue("")
    }
  }, [open])

  // Fuzzy search (unchanged)
  const fuzzySearch = (query: string, text: string): number => {
    if (query.length === 0) return 0

    query = query.toLowerCase()
    text = text.toLowerCase()

    let score = 0
    let queryIndex = 0
    let consecutiveMatches = 0

    if (text.includes(query)) {
      score += 100
      if (text.startsWith(query)) score += 50
    }

    for (let i = 0; i < text.length; i++) {
      if (queryIndex < query.length && text[i] === query[queryIndex]) {
        queryIndex++
        consecutiveMatches++
        score += consecutiveMatches * 2
      } else {
        consecutiveMatches = 0
      }
    }

    if (queryIndex === query.length) score += 20

    return score
  }

  // label map
  const labelMap: Record<string, string> = {
    about: "About",
    projects: "Portfolio",
    experience: "Experience",
    Message: "Message",
    achievements: "Achievements",
    stack: "Tech Stack",
    dark: "Dark mode",
    light: "Light mode",
    reset: "Reset layout",
    github: "GitHub",
    linkedin: "LinkedIn",
    twitter: "Twitter",
    email: "Email",
    close: "Close",
    downloadcv: "Download CV",
  }

  // ---------- Scored suggestions with stricter acceptance ----------
  const scoredSuggestions = (() => {
    const q = inputValue.trim().toLowerCase()
    if (q === "") return [] as string[]

    const scored = allCommands
      .map((cmd) => {
        const label = (labelMap[cmd] ?? cmd).toLowerCase()
        const keyScore = fuzzySearch(q, cmd.toLowerCase())
        const labelScore = fuzzySearch(q, label)
        const combined = Math.max(keyScore, labelScore)
        return { command: cmd, combined, keyScore, labelScore }
      })
      .filter((s) => {
        const cmd = s.command
        const label = (labelMap[cmd] ?? cmd).toLowerCase()
        const startsWithOK = q.length <= cmd.length && cmd.toLowerCase().startsWith(q)
        const labelContains = label.includes(q)
        const fuzzyOK = s.combined >= 120
        return startsWithOK || labelContains || fuzzyOK
      })
      .sort((a, b) => b.combined - a.combined)
      .slice(0, 8)

    return scored.map((s) => s.command)
  })()

  const matchesInput = (cmd: string) => {
    if (inputValue.trim() === "") return true
    return scoredSuggestions.includes(cmd)
  }

  const handleSelect = (value: string) => {
    if (!allCommands.includes(value)) {
      setInputValue("")
      return
    }

    if (socialCommands.includes(value)) {
      let url = ""
      switch (value) {
        case "github":
          url = "https://github.com/luvp21"
          break
        case "linkedin":
          url = "https://linkedin.com/in/luvv"
          break
        case "twitter":
          url = "https://twitter.com/luvp_21"
          break
        case "email":
          url = "mailto:luvvvpatel@email.com"
          break
      }
      window.open(url, "_blank")
      onOpenChange(false)
    } else if (value === "downloadcv") {
      window.open("/Luv.pdf", "_blank")
      onOpenChange(false)
    } else if (value === "close") {
      onOpenChange(false)
    } else {
      onExecuteCommand(value)
      onOpenChange(false)
    }

    setInputValue("")
  }

  // Helper: filtered & ordered sections
  const getFilteredSections = () => {
    const sections: { title: string; items: string[] }[] = [
      { title: "Menu", items: navigationCommands },
      { title: "Appearance", items: appearanceCommands },
      { title: "Tools", items: toolsCommands },
      { title: "Social", items: socialCommands },
      { title: "System", items: systemCommands },
    ]

    const filtered = sections
      .map((section) => {
        let items = section.items.filter((cmd) => matchesInput(cmd))
        if (inputValue.trim() !== "") {
          items = items.sort((a, b) => {
            const ia = scoredSuggestions.indexOf(a)
            const ib = scoredSuggestions.indexOf(b)
            return ia - ib
          })
        }
        return { title: section.title, items }
      })
      .filter((s) => s.items.length > 0)

    return filtered
  }

  // flat visible list in render order
  const visibleList = (() => {
    const sections = getFilteredSections()
    return sections.flatMap((s) => s.items)
  })()

  // keyboard nav + auto-scroll behavior
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (visibleList.length === 0) return
      setMouseActive(false)
      setHighlightIndex((prev) => {
        const next = prev + 1
        // stop at bottom
        return next >= visibleList.length ? prev : next
      })
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (visibleList.length === 0) return
      setMouseActive(false)
      setHighlightIndex((prev) => {
        const next = prev - 1
        // stop at top
        return next < 0 ? prev : next
      })
    } else if (e.key === "Enter") {
      const exactMatch = allCommands.find((cmd) => cmd.toLowerCase() === inputValue.toLowerCase())
      if (exactMatch) {
        handleSelect(exactMatch)
        return
      }
      if (visibleList.length > 0) {
        handleSelect(visibleList[highlightIndex])
      }
    } else if (e.key === "Escape") {
      onOpenChange(false)
    } else if (e.key === "Tab" && inputValue) {
      e.preventDefault()
      const matches = allCommands.filter((cmd) => cmd.startsWith(inputValue.toLowerCase()))
      if (matches.length === 1) setInputValue(matches[0])
    }
  }

  // scroll highlighted item into view when highlightIndex or visibleList changes
  useEffect(() => {
    const cmd = visibleList[highlightIndex]
    if (!cmd) return
    const el = itemRefs.current[cmd]
    if (!el) return
    el.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [highlightIndex, visibleList])

  // Reset highlight when input changes or menu opens
  useEffect(() => {
    setHighlightIndex(0)
  }, [inputValue, open])

  // Mouse movement handler: enable mouseActive for a short window after real movement
  const onMenuMouseMove = () => {
    // enable mouse interactions
    setMouseActive(true)
    // clear previous timer
    if (mouseMoveTimerRef.current) {
      window.clearTimeout(mouseMoveTimerRef.current)
      mouseMoveTimerRef.current = null
    }
    // disable mouseActive after 1500ms of no movement
    mouseMoveTimerRef.current = window.setTimeout(() => {
      setMouseActive(false)
      mouseMoveTimerRef.current = null
    }, 1500)
  }

  // Icon mapping
  const getCommandIcon = (command: string) => {
    switch (command) {
      case "about":
        return <User className="h-4 w-4" />
      case "projects":
        return <Briefcase className="h-4 w-4" />
      case "experience":
        return <History className="h-4 w-4" />
      case "contact":
        return <Mail className="h-4 w-4" />
      case "resume":
        return <FileText className="h-4 w-4" />
      case "skills":
        return <Code className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "light":
        return <Sun className="h-4 w-4" />
      case "achievements":
        return <Award className="h-4 w-4" />
      case "stack":
        return <Layers className="h-4 w-4" />
      case "reset":
        return <RotateCcw className="h-4 w-4" />
      case "github":
        return <Github className="h-4 w-4" />
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "addmessage":
        return <Send className="h-4 w-4" />
      case "viewmessages":
        return <MessageSquare className="h-4 w-4" />
      case "constellation":
        return <Star className="h-4 w-4" />
      case "close":
        return <X className="h-4 w-4" />
      case "downloadcv":
        return <Download className="h-4 w-4" />
      default:
        return <X className="h-4 w-4" />
    }
  }

  // Labels (same as before)
  const getCommandLabel = (key: string) => {
    const map: Record<string, string> = {
      about: "About",
      projects: "Portfolio",
      experience: "Experience",
      Message: "Message",
      achievements: "Achievements",
      stack: "Tech Stack",
      dark: "Dark mode",
      light: "Light mode",
      reset: "Reset layout",
      github: "GitHub",
      linkedin: "LinkedIn",
      twitter: "Twitter",
      email: "Email",
      close: "Close",
      downloadcv: "Download CV",
    }
    return map[key] ?? key
  }

  // Renders menu content
  const renderMenuContent = (): React.ReactNode => {
    const filteredSections = getFilteredSections()

    if (inputValue.trim() !== "" && filteredSections.length === 0) {
      return <div className="p-4 text-sm text-muted-foreground">No matching commands found</div>
    }

    return (
      <div className="p-3">
        {filteredSections.map((section) => (
          <div key={section.title} className="mb-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">{section.title}</div>
            <div className="flex flex-col gap-2">
              {section.items.map((cmd) => {
                const label = getCommandLabel(cmd)
                const desc = commandDescriptions[cmd] ?? ""
                const indexInVisible = visibleList.indexOf(cmd)
                const isActive = indexInVisible === highlightIndex

                return (
                  <button
                    key={cmd}
                    ref={(el) => { itemRefs.current[cmd] = el }}
                    type="button"
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => {
                      // only change highlight via mouse if user actually moved the mouse recently
                      if (mouseActive && indexInVisible >= 0) {
                        setHighlightIndex(indexInVisible)
                      }
                    }}
                    className={
                      "w-full flex items-center justify-between rounded-md px-3 py-2 transition-colors " +
                      (isActive
                        ? "bg-muted rounded-xl"
                        : "hover:bg-muted/50 rounded-xl"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">{getCommandIcon(cmd)}</div>

                      <div className="flex flex-col text-left">
                        <span className="text-foreground text-sm leading-none">{label}</span>
                        {desc && <span className="text-xs text-muted-foreground leading-none mt-0.5">{desc}</span>}
                      </div>
                    </div>

                    <div className="w-4" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const accentColor = theme === "dark" ? "#A374FF" : "hsl(var(--name))"

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-end bg-black/50 backdrop-blur-sm rounded-lg py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="w-full max-w-sm h-full bg-background shadow-lg rounded-lg overflow-hidden flex flex-col border"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full rounded-lg">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <div className="font-medium text-foreground">Menu</div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1 hover:bg-accent rounded-md transition-colors"
                  aria-label="Close command terminal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Command input */}
              <div className="px-4 py-3 border-b">
                <div className="flex items-center">
                  <span className="mr-2 text-muted-foreground">:/</span>
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter Command"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              {/* Menu area (filtered live while typing) */}
              <div
                className="flex-1 overflow-y-auto"
                ref={menuScrollRef}
                onMouseMove={onMenuMouseMove}
              >
                <div className="p-0">{renderMenuContent()}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
