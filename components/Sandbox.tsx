"use client"

import type React from "react"
import { Plus, X, MessageSquare, Info } from "lucide-react"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !containerRef.current) return;
    
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const padding = 20;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    let adjustedX = x + 20; // Default offset from cursor
    let adjustedY = y;
    
    // Check right boundary within container
    if (adjustedX + tooltipRect.width > containerWidth - padding) {
      adjustedX = x - tooltipRect.width - 20; // Position to the left of cursor
    }
    
    // Check left boundary within container
    if (adjustedX < padding) {
      adjustedX = padding;
    }
    
    // Check bottom boundary within container
    if (adjustedY + tooltipRect.height > containerHeight - padding) {
      adjustedY = y - tooltipRect.height - 10; // Position above cursor
    }
    
    // Check top boundary within container
    if (adjustedY < padding) {
      adjustedY = padding;
    }
    
    // Ensure tooltip doesn't go beyond container bounds in any direction
    adjustedX = Math.max(padding, Math.min(adjustedX, containerWidth - tooltipRect.width - padding));
    adjustedY = Math.max(padding, Math.min(adjustedY, containerHeight - tooltipRect.height - padding));
    
    setPosition({ x: adjustedX, y: adjustedY });
  }, [isVisible, x, y, containerRef]);
  
  return { position, tooltipRef };
};

export function Sandbox() {
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

  // Smart tooltip positioning with container bounds
  const { position, tooltipRef } = useSmartTooltip(
    !!hoveredMessage, 
    hoveredMessage?.x_position || 0, 
    hoveredMessage?.y_position || 0,
    containerRef
  );

  // Use only the two specified colors
  const getRandomColor = () => {
    // Use only the two specified colors
    const colors = ["#fffff3", "#A374FF"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Fetch messages from Supabase
  const fetchMessages = async () => {
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
  }

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
      // Generate random position within the canvas
      const containerWidth = containerRef.current?.clientWidth || 800
      const containerHeight = containerRef.current?.clientHeight || 500

      const x_position = Math.random() * (containerWidth - 40) + 20
      const y_position = Math.random() * (containerHeight - 40) + 20
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

  // Initialize particles
  useEffect(() => {
    if (!containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const newParticles = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
      })
    }

    setParticles(newParticles)
  }, [])

  // Animate particles
  useEffect(() => {
    if (!containerRef.current || particles.length === 0) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: particle.y + particle.speed,
          x: particle.x + Math.sin(particle.y * 0.05) * 0.5,
          // Reset particle if it goes off screen
          ...(particle.y > height
            ? {
                y: 0,
                x: Math.random() * width,
              }
            : {}),
        })),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [particles])

  // Draw stars and connections on canvas
  const drawStars = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const containerWidth = containerRef.current?.clientWidth || 800
    const containerHeight = containerRef.current?.clientHeight || 500

    // Set canvas dimensions
    canvas.width = containerWidth
    canvas.height = containerHeight

    // Create a subtle gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, containerHeight)
    gradient.addColorStop(0, "rgba(16, 16, 16, 0.8)")
    gradient.addColorStop(1, "rgba(16, 16, 16, 0.95)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, containerWidth, containerHeight)

    // Draw a decorative pattern
    ctx.strokeStyle = "rgba(163, 116, 255, 0.05)"
    ctx.lineWidth = 0.5

    // Draw grid pattern
    const gridSize = 40
    for (let x = 0; x < containerWidth; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, containerHeight)
      ctx.stroke()
    }

    for (let y = 0; y < containerHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(containerWidth, y)
      ctx.stroke()
    }

    // Draw connections between stars
    ctx.beginPath()
    ctx.strokeStyle = "rgba(163, 116, 255, 0.2)" // Using #A374FF with opacity
    ctx.lineWidth = 0.8

    for (let i = 0; i < messages.length; i++) {
      for (let j = i + 1; j < messages.length; j++) {
        const distance = Math.sqrt(
          Math.pow(messages[i].x_position - messages[j].x_position, 2) +
            Math.pow(messages[i].y_position - messages[j].y_position, 2),
        )

        // Increased distance threshold to create more connections
        if (distance < 250) {
          ctx.moveTo(messages[i].x_position, messages[i].y_position)
          ctx.lineTo(messages[j].x_position, messages[j].y_position)
        }
      }
    }

    ctx.stroke()

    // Draw background stars
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 1.2
      const opacity = Math.random() * 0.5 + 0.1

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)

      // Alternate between the two specified colors
      const color =
        i % 2 === 0
          ? `rgba(255, 255, 243, ${opacity})` // #fffff3 with opacity
          : `rgba(163, 116, 255, ${opacity})` // #A374FF with opacity

      ctx.fillStyle = color
      ctx.fill()
    }
  }

  // Initialize and handle window resize
  useEffect(() => {
    fetchMessages()

    const handleResize = () => {
      drawStars()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Redraw stars when messages change
  useEffect(() => {
    drawStars()
  }, [messages])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-background overflow-hidden">
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
            backgroundColor: index % 2 === 0 ? "rgba(255, 255, 243, 0.3)" : "rgba(163, 116, 255, 0.3)",
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
          whileHover={{ scale: 1.2 }}
          onMouseEnter={() => setHoveredMessage(msg)}
          onMouseLeave={() => setHoveredMessage(null)}
        >
          <div
            className="relative"
            style={{
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <div
              className="absolute h-4 w-4 rounded-full animate-pulse"
              style={{
                backgroundColor: msg.color,
                boxShadow: `0 0 12px ${msg.color}`,
              }}
            />
            <div
              className="h-2 w-2 rounded-full bg-white absolute top-1 left-1"
              style={{
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
            className="absolute z-20 rounded-lg p-4 max-w-xs shadow-lg pointer-events-none"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              backgroundColor: "rgba(16, 16, 16, 0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(163, 116, 255, 0.3)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: hoveredMessage.color,
                  boxShadow: `0 0 5px ${hoveredMessage.color}`,
                }}
              />
              <p className="font-medium text-[#fffff3]">{hoveredMessage.name}</p>
            </div>
            <p className="text-sm text-[#fffff3]/90 leading-relaxed">{hoveredMessage.message}</p>
            <div className="text-xs text-[#fffff3]/50 mt-3 pt-2 border-t border-[#A374FF]/20">
              {new Date(hoveredMessage.created_at).toLocaleDateString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add message button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-4 right-4 rounded-full z-30 border-[#A374FF]/30 bg-black/50 hover:bg-[#A374FF]/20"
        onClick={() => setShowForm(true)}
        style={{
          boxShadow: "0 0 10px rgba(163, 116, 255, 0.2)",
        }}
      >
        <Plus size={20} className="text-[#fffff3]" />
      </Button>

      {/* Info button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-4 left-4 rounded-full z-30 border-[#A374FF]/30 bg-black/50 hover:bg-[#A374FF]/20"
        onClick={() => setShowInfo(!showInfo)}
        style={{
          boxShadow: "0 0 10px rgba(163, 116, 255, 0.2)",
        }}
      >
        <Info size={18} className="text-[#fffff3]" />
      </Button>

      {/* Message count */}
      <div
        className="absolute top-4 left-4 rounded-full px-3 py-1 flex items-center gap-2 text-sm z-30"
        style={{
          backgroundColor: "rgba(16, 16, 16, 0.7)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(163, 116, 255, 0.3)",
          color: "#fffff3",
        }}
      >
        <MessageSquare size={14} className="text-[#A374FF]" />
        <span>{messages.length} messages</span>
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-4 z-30 max-w-xs p-4 rounded-lg"
            style={{
              backgroundColor: "rgba(16, 16, 16, 0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(163, 116, 255, 0.3)",
            }}
          >
            <h4 className="font-bold text-[#A374FF] mb-2">About This Space</h4>
            <p className="text-sm text-[#fffff3]/90 mb-3">
              This interactive space allows visitors to leave messages as glowing stars.
            </p>
            <p className="text-sm text-[#fffff3]/90 mb-3">
              Hover over any star to read the message left by another visitor.
            </p>
            <p className="text-sm text-[#fffff3]/90">
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
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-40"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="max-w-md w-full mx-4 rounded-lg p-6"
              style={{
                backgroundColor: "rgba(16, 16, 16, 0.9)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#fffff3]">Add Your Message</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#A374FF]/10"
                  onClick={() => setShowForm(false)}
                >
                  <X size={18} className="text-[#fffff3]" />
                </Button>
              </div>

              <form onSubmit={addMessage} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-[#fffff3]">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-black/50 border-[#A374FF]/30 text-[#fffff3] placeholder:text-[#fffff3]/50"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-[#fffff3]">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="bg-black/50 border-[#A374FF]/30 min-h-[100px] text-[#fffff3] placeholder:text-[#fffff3]/50"
                    maxLength={280}
                  />
                  <div className="text-xs text-right text-[#fffff3]/60">{message.length}/280</div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#A374FF]/30 hover:bg-[#A374FF]/10 text-[#fffff3]"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#A374FF] hover:bg-[#A374FF]/80 text-[#fffff3]"
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
}