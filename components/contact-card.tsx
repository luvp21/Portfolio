"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Github, Linkedin, Twitter, Coffee, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ContactCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showCoffeeForm, setShowCoffeeForm] = useState(false)
  // const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 })

  // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  //   const card = e.currentTarget
  //   const rect = card.getBoundingClientRect()
  //   const x = e.clientX - rect.left
  //   const y = e.clientY - rect.top

  //   const centerX = rect.width / 2
  //   const centerY = rect.height / 2

  //   const rotateY = ((x - centerX) / centerX) * 15
  //   const rotateX = ((centerY - y) / centerY) * 15

  //   setCardRotation({ x: rotateX, y: rotateY })
  // }

  // const resetCardRotation = () => {
  //   setCardRotation({ x: 0, y: 0 })
  // }

  return (
    <div className="relative w-full h-[300px] perspective">
      <AnimatePresence initial={false} mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            className="absolute inset-0 backface-hidden bg-card rounded-lg shadow-md p-6 flex flex-col business-card"
            initial={{ rotateY: 180 }}
            animate={{
              rotateY: 0,
              rotateX: 0,
              rotateZ: 0,
            }}
            exit={{ rotateY: 180 }}
            transition={{
              duration: isFlipped ? 0.6 : 0.1,
              type: isFlipped ? "spring" : "tween",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <div className="flex justify-between items-start h-full">

              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 opacity-50"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-primary/10 opacity-50"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/5 opacity-30"></div>
              {/* Left side - Personal Info */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold mb-1">Luv Patel</h3>
                  <p className="text-muted-foreground mb-4">Full-Stack Developer</p>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm">+91 6355961895</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm">luvp2112@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm">India</span>
                  </div>
                </div>
              </div>

              {/* Right side - Social & Actions */}
              <div className="flex flex-col justify-between h-full">
                <div className="flex gap-2 justify-end">
                  <a href="https://github.com/luvp21" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <Github className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href="https://linkedin.com/in/luvv" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </a>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button onClick={() => setIsFlipped(true)} size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" onClick={() => setShowCoffeeForm(true)} size="sm">
                    <Coffee className="mr-2 h-4 w-4" />
                    Coffee
                  </Button>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            
          </motion.div>
        ) : (
          <motion.div
            key="back"
            className="absolute inset-0 backface-hidden bg-card rounded-lg shadow-md p-6 business-card"
            initial={{ rotateY: -180 }}
            animate={{
              rotateY: 0,
              rotateX: 0,
              rotateZ: 0,
            }}
            exit={{ rotateY: -180 }}
            transition={{
              duration: isFlipped ? 0.1 : 0.6,
              type: isFlipped ? "tween" : "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <h3 className="text-xl font-bold mb-4">Send a Message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Your Email" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Textarea placeholder="Your Message" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Send</Button>
                <Button variant="outline" onClick={() => setIsFlipped(false)}>
                  Back
                </Button>
              </div>
            </form>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 opacity-50"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-primary/10 opacity-50"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coffee Chat Modal */}
      <AnimatePresence>
        {showCoffeeForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCoffeeForm(false)}
          >
            <motion.div
              className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Schedule a Coffee Chat</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Let's grab a virtual coffee and discuss your project ideas or just chat about tech!
              </p>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Input placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Your Email" type="email" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Preferred Date & Time" />
                </div>
                <div className="space-y-2">
                  <Textarea placeholder="What would you like to discuss?" rows={3} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Schedule</Button>
                  <Button variant="outline" onClick={() => setShowCoffeeForm(false)}>
                    Cancel
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
