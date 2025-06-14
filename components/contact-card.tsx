"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Github, Linkedin, Twitter, Coffee, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "@/components/theme-provider"

export function ContactCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showCoffeeForm, setShowCoffeeForm] = useState(false)
  const { theme } = useTheme()

  const cardBackground =
    theme === "dark"
      ? "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)"
      : "linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)"

  const cardShadow = theme === "dark" ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)" : "0 8px 32px 0 rgba(0, 0, 0, 0.1)"

  const cardBorder = theme === "dark" ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(0, 0, 0, 0.1)"

  const decorativeColor = theme === "dark" ? "rgba(163, 116, 255, 0.1)" : "rgba(124, 58, 237, 0.1)"

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
              background: cardBackground,
              boxShadow: cardShadow,
              backdropFilter: "blur(4px)",
              border: cardBorder,
            }}
          >
            <div className="flex justify-between items-start h-full">
              <div
                className="absolute top-4 right-4 w-12 h-12 rounded-full opacity-50"
                style={{ backgroundColor: decorativeColor }}
              ></div>
              <div
                className="absolute bottom-4 left-4 w-8 h-8 rounded-full opacity-50"
                style={{ backgroundColor: decorativeColor }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-30"
                style={{ backgroundColor: decorativeColor }}
              ></div>
              {/* Left side - Personal Info */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold mb-1 text-foreground">Luv Patel</h3>
                  <p className="text-muted-foreground mb-4">Full-Stack Developer</p>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-name" />
                    <span className="text-sm text-foreground">+91 6355961895</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-name" />
                    <span className="text-sm text-foreground">luvp2112@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-name" />
                    <span className="text-sm text-foreground">India</span>
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
              background: cardBackground,
              boxShadow: cardShadow,
              backdropFilter: "blur(4px)",
              border: cardBorder,
            }}
          >
            <h3 className="text-xl font-bold mb-4 text-foreground">Send a Message</h3>
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
            <div
              className="absolute top-4 right-4 w-12 h-12 rounded-full opacity-50"
              style={{ backgroundColor: decorativeColor }}
            ></div>
            <div
              className="absolute bottom-4 left-4 w-8 h-8 rounded-full opacity-50"
              style={{ backgroundColor: decorativeColor }}
            ></div>
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
              className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-5 h-5 text-name" />
                <h3 className="text-xl font-bold text-foreground">Schedule a Coffee Chat</h3>
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