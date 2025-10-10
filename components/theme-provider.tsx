"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface ThemeContextProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "dark",
  setTheme: () => {},
})

// 👇 Your responsive hook
function useResponsive() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth
      setIsMobile(width < 768) // md breakpoint
      setIsTablet(width >= 768 && width < 1024) // lg breakpoint
    }

    checkResponsive()
    window.addEventListener("resize", checkResponsive)
    return () => window.removeEventListener("resize", checkResponsive)
  }, [])

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet }
}

// 👇 Theme provider with responsive logic
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const { isMobile } = useResponsive()

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme)
    } else if (isMobile) {
      // 👇 Auto-set to light if mobile
      setTheme("light")
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }, [isMobile]) // 👈 watch for screen-size changes dynamically

  useEffect(() => {
    localStorage.setItem("theme", theme)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)