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
  HelpCircle,
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

interface CommandBarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExecuteCommand: (command: string) => void
}

interface CommandHistoryItem {
  type: "command" | "response"
  content: string | React.ReactNode
}

export function CommandBar({ open, onOpenChange, onExecuteCommand }: CommandBarProps) {
  const [inputValue, setInputValue] = useState("")
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const historyRef = useRef<HTMLDivElement | null>(null)

  // Available commands - removed blog, theme, and project-specific commands
  const navigationCommands = ["about", "projects", "experience", "contact", "resume", "skills"]
  const appearanceCommands = ["dark", "light"]
  const toolsCommands = ["achievements", "stack", "reset"]
  const socialCommands = ["github", "linkedin", "twitter", "email"]
  const messageCommands = ["addmessage", "viewmessages", "constellation"]
  const systemCommands = ["help", "clear", "close", "downloadcv"]

  // All commands
  const allCommands = [
    ...navigationCommands,
    ...appearanceCommands,
    ...toolsCommands,
    ...socialCommands,
    ...messageCommands,
    ...systemCommands,
  ]

  // Command descriptions for help
  const commandDescriptions: Record<string, string> = {
    // Navigation
    about: "Open the About Me panel",
    projects: "Open the Projects panel",
    experience: "Open the Experience panel",
    contact: "Open the Contact panel",
    resume: "Open the Message Constellation panel",
    skills: "View my technical skills",

    // Appearance
    dark: "Switch to dark mode",
    light: "Switch to light mode",

    // Tools
    achievements: "Open the Achievements panel",
    stack: "Open the Tech Stack panel",
    reset: "Reset panel positions",

    // Social
    github: "Visit my GitHub profile",
    linkedin: "Connect with me on LinkedIn",
    twitter: "Follow me on Twitter",
    email: "Send me an email",

    // Message Constellation
    addmessage: "Add a message to the constellation",
    viewmessages: "View all constellation messages",
    constellation: "Open the message constellation",

    // System
    help: "Show available commands",
    clear: "Clear command history",
    close: "Close the command terminal",
    downloadcv: "Download my resume/CV",
  }

  useEffect(() => {
    if (open) {
      // Focus input when menu opens
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setInputValue("")
      setHistoryIndex(-1)
    }
  }, [open])

  // Scroll to bottom of history when it changes
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [commandHistory])

  // Fuzzy search function
  const fuzzySearch = (query: string, text: string): number => {
    if (query.length === 0) return 0

    query = query.toLowerCase()
    text = text.toLowerCase()

    let score = 0
    let queryIndex = 0
    let consecutiveMatches = 0

    // Direct match gets highest score
    if (text.includes(query)) {
      score += 100
      // Bonus for match at start
      if (text.startsWith(query)) {
        score += 50
      }
    }

    // Check for partial matches
    for (let i = 0; i < text.length; i++) {
      if (queryIndex < query.length && text[i] === query[queryIndex]) {
        queryIndex++
        consecutiveMatches++
        score += consecutiveMatches * 2 // Consecutive matches are worth more
      } else {
        consecutiveMatches = 0
      }
    }

    // If we matched all query characters in order
    if (queryIndex === query.length) {
      score += 20
    }

    return score
  }

  // Get suggestions based on fuzzy search
  const getSuggestions = () => {
    if (inputValue.trim() === "") {
      return [] // Don't show suggestions when input is empty
    } else {
      // Score each command based on fuzzy search
      const scoredCommands = allCommands.map((cmd) => ({
        command: cmd,
        score: fuzzySearch(inputValue, cmd),
      }))

      // Filter out commands with zero score and sort by score (descending)
      return scoredCommands
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.command)
        .slice(0, 8) // Limit to 8 suggestions
    }
  }

  const addToHistory = (command: string, isCommand = true) => {
    // Don't add duplicates in a row
    if (
      commandHistory.length === 0 ||
      commandHistory[commandHistory.length - 1].content !== command ||
      commandHistory[commandHistory.length - 1].type !== "command"
    ) {
      setCommandHistory([...commandHistory, { type: isCommand ? "command" : "response", content: command }])
    }
    setHistoryIndex(-1)
  }

  const getCommandsOnly = () => {
    return commandHistory
      .filter((item) => item.type === "command" && typeof item.content === "string")
      .map((item) => item.content as string)
  }

  const handleSelect = (value: string) => {
    // Make sure value is a valid command
    if (!allCommands.includes(value)) {
      addToHistory(value)
      addToHistory(`Command not found: ${value}`, false)
      setInputValue("")
      return
    }

    addToHistory(value)

    if (value === "clear") {
      setCommandHistory([])
    } else if (value === "help") {
      // Add help content to history
      addToHistory(renderHelpContent(), false)
    } else if (value === "close") {
      onOpenChange(false)
    } else if (socialCommands.includes(value)) {
      // Handle social links
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
      addToHistory(`Opening ${value}...`, false)
    } else if (value === "downloadcv") {
      
      window.open("/luv.pdf", "_blank")
      addToHistory("Downloading CV...", false)
    } else {
      // Execute regular command
      onExecuteCommand(value)
      onOpenChange(false)
    }

    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue) {
      // First check for exact matches
      const exactMatch = allCommands.find((cmd) => cmd.toLowerCase() === inputValue.toLowerCase())

      if (exactMatch) {
        handleSelect(exactMatch)
      } else {
        // If no exact match, check for fuzzy matches and use the top result
        const suggestions = getSuggestions()
        if (suggestions.length > 0) {
          handleSelect(suggestions[0])
        } else if (inputValue.trim() !== "") {
          // No matches at all
          addToHistory(inputValue)
          addToHistory(`Command not found: ${inputValue}`, false)
          setInputValue("")
        }
      }
    } else if (e.key === "Escape") {
      onOpenChange(false)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const commandsOnly = getCommandsOnly()
      if (commandsOnly.length > 0) {
        const newIndex = historyIndex < commandsOnly.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInputValue(commandsOnly[commandsOnly.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const commandsOnly = getCommandsOnly()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInputValue(commandsOnly[commandsOnly.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInputValue("")
      }
    } else if (e.key === "Tab" && inputValue) {
      e.preventDefault()
      // Simple tab completion
      const matches = allCommands.filter((cmd) => cmd.startsWith(inputValue.toLowerCase()))
      if (matches.length === 1) {
        setInputValue(matches[0])
      }
    }
  }

  // Get icon for command
  const getCommandIcon = (command: string) => {
    switch (command) {
      // Navigation
      case "about":
        return <User className="h-3 w-3" />
      case "projects":
        return <Briefcase className="h-3 w-3" />
      case "experience":
        return <History className="h-3 w-3" />
      case "contact":
        return <Mail className="h-3 w-3" />
      case "resume":
        return <FileText className="h-3 w-3" />
      case "skills":
        return <Code className="h-3 w-3" />

      // Appearance
      case "dark":
        return <Moon className="h-3 w-3" />
      case "light":
        return <Sun className="h-3 w-3" />

      // Tools
      case "achievements":
        return <Award className="h-3 w-3" />
      case "stack":
        return <Layers className="h-3 w-3" />
      case "reset":
        return <RotateCcw className="h-3 w-3" />

      // Social
      case "github":
        return <Github className="h-3 w-3" />
      case "linkedin":
        return <Linkedin className="h-3 w-3" />
      case "twitter":
        return <Twitter className="h-3 w-3" />
      case "email":
        return <Mail className="h-3 w-3" />

      // Message Constellation
      case "addmessage":
        return <Send className="h-3 w-3" />
      case "viewmessages":
        return <MessageSquare className="h-3 w-3" />
      case "constellation":
        return <Star className="h-3 w-3" />

      // System
      case "help":
        return <HelpCircle className="h-3 w-3" />
      case "clear":
        return <Code className="h-3 w-3" />
      case "close":
        return <X className="h-3 w-3" />
      case "downloadcv":
        return <Download className="h-3 w-3" />

      default:
        return <HelpCircle className="h-3 w-3" />
    }
  }

  // Render help content with terminal-style formatting
  const renderHelpContent = () => {
    return (
      <div className="p-2 text-sm">
        <div className="flex items-center text-muted-foreground mb-3">
          <span className="mr-2 font-mono">{">"}</span>
          <span className="mr-1 text-[#A374FF]">_</span>
          <span>help</span>
        </div>

        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Navigation</div>
          <div className="grid grid-cols-1 gap-1">
            {navigationCommands.map((cmd) => (
              <div key={cmd} className="flex items-center">
                {getCommandIcon(cmd)}
                <span className="ml-2 mr-2">{cmd}</span>
                <span className="text-xs text-muted-foreground">- {commandDescriptions[cmd]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Appearance</div>
          <div className="grid grid-cols-1 gap-1">
            {appearanceCommands.map((cmd) => (
              <div key={cmd} className="flex items-center">
                {getCommandIcon(cmd)}
                <span className="ml-2 mr-2">{cmd}</span>
                <span className="text-xs text-muted-foreground">- {commandDescriptions[cmd]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Tools</div>
          <div className="grid grid-cols-1 gap-1">
            {toolsCommands.map((cmd) => (
              <div key={cmd} className="flex items-center">
                {getCommandIcon(cmd)}
                <span className="ml-2 mr-2">{cmd}</span>
                <span className="text-xs text-muted-foreground">- {commandDescriptions[cmd]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Social</div>
          <div className="grid grid-cols-1 gap-1">
            {socialCommands.map((cmd) => (
              <div key={cmd} className="flex items-center">
                {getCommandIcon(cmd)}
                <span className="ml-2 mr-2">{cmd}</span>
                <span className="text-xs text-muted-foreground">- {commandDescriptions[cmd]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Message Constellation</div>
          <div className="grid grid-cols-1 gap-1">
            {messageCommands.map((cmd) => (
              <div key={cmd} className="flex items-center">
                {getCommandIcon(cmd)}
                <span className="ml-2 mr-2">{cmd}</span>
                <span className="text-xs text-muted-foreground">- {commandDescriptions[cmd]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">System</div>
          <div className="grid grid-cols-1 gap-1">
            {systemCommands.map((cmd) => (
              <div key={cmd} className="flex items-center">
                {getCommandIcon(cmd)}
                <span className="ml-2 mr-2">{cmd}</span>
                <span className="text-xs text-muted-foreground">- {commandDescriptions[cmd]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Get suggestions to display
  const suggestions = getSuggestions()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-end bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className="w-full max-w-sm h-full bg-background border-l shadow-lg overflow-hidden flex flex-col"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="text-center py-4 border-b font-medium">Command Terminal</div>

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

              {/* Instruction text or suggestions */}
              <div className="px-4 py-3 border-b">
                {inputValue === "" ? (
                  <div className="text-sm text-muted-foreground">Start typing and see where it leads you...</div>
                ) : suggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((cmd, index) => (
                      <span key={index} className="text-sm bg-background/50 px-2 py-1 rounded">
                        {cmd}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No matching commands found</div>
                )}
              </div>

              {/* Command history */}
              {commandHistory.length > 0 && (
                <div ref={historyRef} className="flex-1 overflow-y-auto p-4 text-sm">
                  {commandHistory.map((item, index) => (
                    <div key={index} className="mb-2">
                      {item.type === "command" ? (
                        <div className="flex items-center text-muted-foreground">
                          <span className="mr-2 font-mono">{">"}</span>
                          <span className="text-[#A374FF]">_</span>
                          <span>{item.content}</span>
                        </div>
                      ) : (
                        <div className="pl-5">{item.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-2 border-t text-xs text-center text-muted-foreground">ESC to close</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}