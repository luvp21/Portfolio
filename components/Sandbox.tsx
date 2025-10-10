"use client"

import React from "react"
import { Plus, X, MessageSquare, Info } from "lucide-react"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/components/theme-provider"

interface Message {
  id: number
  name: string
  message: string
  x_position: number
  y_position: number
  color: string
  created_at: string
}

// Custom hook for smart tooltip positioning within container bounds
const useSmartTooltip = (isVisible: boolean, x: number, y: number, containerRef: React.RefObject<HTMLDivElement>) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !containerRef.current) return

    const tooltip = tooltipRef.current
    const container = containerRef.current
    const tooltipRect = tooltip.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const padding = window.innerWidth < 768 ? 10 : 20 // Smaller padding on mobile
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    let adjustedX = x + (window.innerWidth < 768 ? 10 : 20) // Smaller offset on mobile
    let adjustedY = y

    // Check right boundary within container
    if (adjustedX + tooltipRect.width > containerWidth - padding) {
      adjustedX = x - tooltipRect.width - (window.innerWidth < 768 ? 10 : 20)
    }

    // Check left boundary within container
    if (adjustedX < padding) {
      adjustedX = padding
    }

    // Check bottom boundary within container
    if (adjustedY + tooltipRect.height > containerHeight - padding) {
      adjustedY = y - tooltipRect.height - 10
    }

    // Check top boundary within container
    if (adjustedY < padding) {
      adjustedY = padding
    }

    // Ensure tooltip doesn't go beyond container bounds in any direction
    adjustedX = Math.max(padding, Math.min(adjustedX, containerWidth - tooltipRect.width - padding))
    adjustedY = Math.max(padding, Math.min(adjustedY, containerHeight - tooltipRect.height - padding))

    setPosition({ x: adjustedX, y: adjustedY })
  }, [isVisible, x, y, containerRef])

  return { position, tooltipRef }
}

// Custom hook for responsive dimensions
const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
    isTablet: typeof window !== "undefined" ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Call once to set initial values

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return dimensions
}

export const Sandbox = React.memo(function Sandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [hoveredMessage, setHoveredMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; speed: number }[]>([])
  const { theme } = useTheme()

  const { width, height, isMobile, isTablet } = useResponsiveDimensions()

  // Responsive star sizes
  const starSize = useMemo(() => {
    if (isMobile) return { outer: 12, inner: 6, top: 3, left: 3 }
    if (isTablet) return { outer: 14, inner: 7, top: 3.5, left: 3.5 }
    return { outer: 16, inner: 8, top: 4, left: 4 }
  }, [isMobile, isTablet])

  // Smart tooltip positioning with container bounds
  const { position, tooltipRef } = useSmartTooltip(
    !!hoveredMessage,
    hoveredMessage?.x_position || 0,
    hoveredMessage?.y_position || 0,
    containerRef,
  )

  // Use theme-aware colors
  const getRandomColor = useCallback(() => {
    const lightColors = ["#fffff3", "#A374FF"]
    const darkColors = ["#fffff3", "#A374FF"]
    const colors = theme === "dark" ? darkColors : lightColors
    return colors[Math.floor(Math.random() * colors.length)]
  }, [theme])

  // Fetch messages from Supabase
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching messages:", error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }, [])

  // Add a new message
  const addMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both your name and a message.",
        variant: "destructive",
      })
      return                                                                                                                                                                                                                                                
    }

    setIsLoading(true)

    try {
      // Generate random position within the canvas with responsive margins
      const containerWidth = containerRef.current?.clientWidth || width
      const containerHeight = containerRef.current?.clientHeight || height

      const margin = isMobile ? 30 : 40 // Larger margin on mobile for touch targets
      const x_position = Math.random() * (containerWidth - margin * 2) + margin
      const y_position = Math.random() * (containerHeight - margin * 2) + margin
      const color = getRandomColor()

      const { data, error } = await supabase                                                                                                                                     
        .from("messages")
        .insert([{ name, message, x_position, y_position, color }])
        .select()

      if (error) {
        console.error("Error adding message:", error)
        toast({
          title: "Error",
          description: "Failed to add your message. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Message added",
        description: "Your message has been added to the constellation!",
      })

      setName("")
      setMessage("")
      setShowForm(false)
      fetchMessages()
    } catch (error) {
      console.error("Error adding message:", error)
      toast({
        title: "Error",
        description: "Failed to add your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize particles with responsive count
  useEffect(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    // Adjust particle count based on screen size
    const particleCount = isMobile ? 20 : isTablet ? 35 : 50

    const newParticles = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * containerWidth,
        y: Math.random() * containerHeight,
        size: Math.random() * (isMobile ? 1.5 : 2) + 0.5,
        speed: Math.random() * 0.3 + 0.1,
      })
    }

    setParticles(newParticles)
  }, [width, height, isMobile, isTablet])

  // Animate particles
  useEffect(() => {
    if (!containerRef.current || particles.length === 0) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: particle.y + particle.speed,
          x: particle.x + Math.sin(particle.y * 0.05) * 0.5,
          // Reset particle if it goes off screen
          ...(particle.y > containerHeight
            ? {
                y: 0,
                x: Math.random() * containerWidth,
              }
            : {}),
        })),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [particles, width, height])

  // Draw stars and connections on canvas
  const drawStars = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !containerRef.current) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    // Set canvas dimensions
    canvas.width = containerWidth
    canvas.height = containerHeight

    // Create a theme-aware gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, containerHeight)
    if (theme === "dark") {
      gradient.addColorStop(0, "rgba(16, 16, 16, 0.8)")
      gradient.addColorStop(1, "rgba(16, 16, 16, 0.95)")
    } else {
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)")
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.95)")
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, containerWidth, containerHeight)

    // Draw connections between stars with responsive distance
    ctx.beginPath()
    ctx.strokeStyle = theme === "dark" ? "rgba(163, 116, 255, 0.2)" : "rgba(124, 58, 237, 0.2)"
    ctx.lineWidth = 0.8

    const connectionDistance = isMobile ? 150 : isTablet ? 200 : 250
    const starCenterOffset = starSize.outer / 2 // Offset to center of star

    for (let i = 0; i < messages.length; i++) {
      for (let j = i + 1; j < messages.length; j++) {
        const distance = Math.sqrt(
          Math.pow(messages[i].x_position - messages[j].x_position, 2) +
            Math.pow(messages[i].y_position - messages[j].y_position, 2),
        )

        if (distance < connectionDistance) {
          // Connect to the center of each star
          const centerX1 = messages[i].x_position + starCenterOffset
          const centerY1 = messages[i].y_position + starCenterOffset
          const centerX2 = messages[j].x_position + starCenterOffset
          const centerY2 = messages[j].y_position + starCenterOffset
          
          ctx.moveTo(centerX1, centerY1)
          ctx.lineTo(centerX2, centerY2)
        }
      }
    }

    ctx.stroke()

    // Draw background stars with responsive count
    const starCount = isMobile ? 100 : isTablet ? 150 : 200
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * (isMobile ? 0.8 : 1.2)
      const opacity = Math.random() * 0.5 + 0.1

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)

      const color =
        theme === "dark"
          ? i % 2 === 0
            ? `rgba(255, 255, 243, ${opacity})`
            : `rgba(163, 116, 255, ${opacity})`
          : i % 2 === 0
            ? `rgba(124, 58, 237, ${opacity})`
            : `rgba(16, 16, 16, ${opacity})`

      ctx.fillStyle = color
      ctx.fill()
    }
  }, [messages, theme, isMobile, isTablet, starSize])

  // Initialize and handle window resize
  useEffect(() => {
    fetchMessages()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw stars when messages or dimensions change
  useEffect(() => {
    drawStars()
  }, [messages, width, height, isMobile, isTablet, theme]) // eslint-disable-line react-hooks/exhaustive-deps

  // Theme-aware colors
  const primaryColor = theme === "dark" ? "#fffff3" : "hsl(var(--name))"
  const secondaryColor = theme === "dark" ? "#A374FF" : "hsl(var(--primary))"
  const backgroundColor = theme === "dark" ? "#101010" : "#ffffff"
  const borderColor = theme === "dark" ? "rgba(163, 116, 255, 0.3)" : "rgba(124, 58, 237, 0.3)"
  const textColor = theme === "dark" ? "#fffff3" : "hsl(var(--foreground))"

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden min-h-[300px]">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Floating particles */}
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full z-0"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor:
              index % 2 === 0
                ? theme === "dark"
                  ? "rgba(255, 255, 243, 0.3)"
                  : "rgba(109, 42, 226, 0.77)"
                : theme === "dark"
                  ? "hsla(260, 100.00%, 72.70%, 0.30)"
                  : "rgba(16, 16, 16, 0.64)",
            transition: "top 0.5s linear, left 0.5s ease-in-out",
          }}
        />
      ))}

      {/* Message stars */}
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          className="absolute z-10 cursor-pointer"
          style={{
            left: `${msg.x_position}px`,
            top: `${msg.y_position}px`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: isMobile ? 1.1 : 1.2 }} // Smaller hover scale on mobile
          whileTap={{ scale: 0.95 }} // Add tap feedback for mobile
          onMouseEnter={() => !isMobile && setHoveredMessage(msg)} // Only on hover for desktop
          onMouseLeave={() => !isMobile && setHoveredMessage(null)}
          onClick={() => isMobile && setHoveredMessage(hoveredMessage?.id === msg.id ? null : msg)} // Toggle on mobile
        >
          <div
            className={`relative`}
            style={{
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <div
              className={`absolute rounded-full animate-pulse`}
              style={{
                width: `${starSize.outer}px`,
                height: `${starSize.outer}px`,
                backgroundColor: msg.color,
                boxShadow: `0 0 ${isMobile ? 8 : 12}px ${msg.color}`,
              }}
            />
            <div
              className="rounded-full absolute"
              style={{
                width: `${starSize.inner}px`,
                height: `${starSize.inner}px`,
                top: `${starSize.top}px`,
                left: `${starSize.left}px`,
                backgroundColor: theme === "dark" ? "white" : "#a374ff",
                opacity: 0.8,
              }}
            />
          </div>
        </motion.div>
      ))}

      {/* Smart message tooltip */}
      <AnimatePresence>
        {hoveredMessage && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute z-[9999] rounded-lg p-3 shadow-lg border ${
              isMobile ? "max-w-[280px] pointer-events-auto" : "max-w-xs pointer-events-none"
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              backgroundColor: backgroundColor,
              backdropFilter: "blur(8px)",
              borderColor: borderColor,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
            }}
            onClick={() => isMobile && setHoveredMessage(null)} // Allow closing on mobile
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`rounded-full ${isMobile ? "w-2.5 h-2.5" : "w-3 h-3"}`}
                style={{
                  backgroundColor: hoveredMessage.color,
                  boxShadow: `0 0 5px ${hoveredMessage.color}`,
                }}
              />
              <p className={`font-medium ${isMobile ? "text-sm" : ""}`} style={{ color: textColor }}>
                {hoveredMessage.name}
              </p>
            </div>
            <p
              className={`leading-relaxed ${isMobile ? "text-xs" : "text-sm"}`}
              style={{ color: textColor, opacity: 0.9 }}
            >
              {hoveredMessage.message}
            </p>
            <div
              className={`mt-3 pt-2 border-t ${isMobile ? "text-[10px]" : "text-xs"}`}
              style={{
                borderColor: borderColor,
                color: textColor,
                opacity: 0.5,
              }}
            >
              {new Date(hoveredMessage.created_at).toLocaleDateString()}
            </div>
            {isMobile && (
              <div className="text-[10px] mt-1 text-center" style={{ color: textColor, opacity: 0.4 }}>
                Tap to close
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add message button */}
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        className={`absolute ${isMobile ? "bottom-4 right-4 h-12 w-12" : "bottom-4 right-4"} rounded-full z-30`}
        style={{
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          boxShadow: `0 0 10px ${borderColor}`,
        }}
        onClick={() => setShowForm(true)}
      >
        <Plus size={isMobile ? 18 : 20} style={{ color: textColor }} />
      </Button>

      {/* Info button */}
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        className={`absolute ${isMobile ? "bottom-4 left-4 h-12 w-12" : "bottom-4 left-4"} rounded-full z-30`}
        style={{
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          boxShadow: `0 0 10px ${borderColor}`,
        }}
        onClick={() => setShowInfo(!showInfo)}
      >
        <Info size={isMobile ? 16 : 18} style={{ color: textColor }} />
      </Button>

      {/* Message count */}
      <div
        className={`absolute top-4 left-4 rounded-full px-3 py-1 flex items-center gap-2 z-30 ${
          isMobile ? "text-xs" : "text-sm"
        }`}
        style={{
          backgroundColor: backgroundColor,
          backdropFilter: "blur(4px)",
          borderColor: borderColor,
          border: `1px solid ${borderColor}`,
          color: textColor,
        }}
      >
        <MessageSquare size={isMobile ? 12 : 14} style={{ color: secondaryColor }} />
        <span>{messages.length} messages</span>
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute ${
              isMobile ? "bottom-20 left-4 right-4" : "bottom-16 left-4 max-w-xs"
            } z-30 p-4 rounded-lg border`}
            style={{
              backgroundColor: backgroundColor,
              backdropFilter: "blur(8px)",
              borderColor: borderColor,
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className={`font-bold ${isMobile ? "text-base" : ""}`} style={{ color: secondaryColor }}>
                About This Space
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setShowInfo(false)}
              >
                <X size={isMobile ? 14 : 16} style={{ color: textColor }} />
              </Button>
            </div>

            <p className={`mb-3 ${isMobile ? "text-sm" : "text-sm"}`} style={{ color: textColor, opacity: 0.9 }}>
              This interactive space allows visitors to leave messages as glowing stars.
            </p>
            <p className={`mb-3 ${isMobile ? "text-sm" : "text-sm"}`} style={{ color: textColor, opacity: 0.9 }}>
              {isMobile ? "Tap" : "Hover over"} any star to read the message left by another visitor.
            </p>
            <p className={`${isMobile ? "text-sm" : "text-sm"}`} style={{ color: textColor, opacity: 0.9 }}>
              Add your own message by clicking the + button in the bottom right corner.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add message form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-40 p-4"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className={`w-full rounded-lg p-6 border ${isMobile ? "max-w-sm" : "max-w-md"}`}
              style={{
                backgroundColor: backgroundColor,
                backdropFilter: "blur(12px)",
                borderColor: borderColor,
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold ${isMobile ? "text-lg" : "text-xl"}`} style={{ color: textColor }}>
                  Add Your Message
                </h3>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowForm(false)}>
                  <X size={isMobile ? 16 : 18} style={{ color: textColor }} />
                </Button>
              </div>

              <form onSubmit={addMessage} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className={`font-medium ${isMobile ? "text-sm" : "text-sm"}`}
                    style={{ color: textColor }}
                  >
                    Your Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Who are you, mysterious visitor?"
                    className={`${isMobile ? "text-sm" : ""}`}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className={`font-medium ${isMobile ? "text-sm" : "text-sm"}`}
                    style={{ color: textColor }}
                  >
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Drop a message into the void..."
                    className={`${isMobile ? "min-h-[80px] text-sm" : "min-h-[100px]"}`}
                    maxLength={280}
                  />
                  <div
                    className={`text-right ${isMobile ? "text-xs" : "text-xs"}`}
                    style={{ color: textColor, opacity: 0.6 }}
                  >
                    {message.length}/280
                  </div>
                </div>

                <div className={`flex gap-3 pt-2 ${isMobile ? "flex-col" : ""}`}>
                  <Button
                    type="button"
                    variant="outline"
                    className={`${isMobile ? "w-full" : "flex-1"}`}
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className={`${isMobile ? "w-full" : "flex-1"}`}
                    disabled={isLoading || !name.trim() || !message.trim()}
                  >
                    {isLoading ? "Adding..." : "Add Message"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})