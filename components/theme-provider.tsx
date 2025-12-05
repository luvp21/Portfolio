// components/theme-provider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme; // explicit/stored theme
  setTheme: (t: Theme) => void; // setter
  resolvedTheme: Theme; // applied theme (useful for components that expect next-themes API)
}

/**
 * Default context — consumer must be wrapped by provider.
 */
const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: () => { },
  resolvedTheme: "light",
});

/* responsive hook (keeps your original responsive logic) */
function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkResponsive = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useResponsive();

  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("theme", newTheme);
    } catch { }
    setThemeState(newTheme);
    setResolvedTheme(newTheme);

    if (typeof document !== "undefined") {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = (() => {
      try {
        return localStorage.getItem("theme");
      } catch {
        return null;
      }
    })();

    if (stored === "dark" || stored === "light") {
      setThemeState(stored);
      setResolvedTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
    } else if (isMobile) {
      // your custom behaviour: default to light on mobile
      setThemeState("light");
      setResolvedTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    } else {
      // no stored pref -> follow system preference
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystem = (prefersDark: boolean) => {
        const sys = prefersDark ? "dark" : "light";
        setResolvedTheme(sys);
        if (sys === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      };

      applySystem(mq.matches);

      const onChange = (e: MediaQueryListEvent) => {
        const hasStored = (() => {
          try {
            return !!localStorage.getItem("theme");
          } catch {
            return false;
          }
        })();

        if (!hasStored) {
          applySystem(e.matches);
        }
      };

      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else mq.addListener(onChange);

      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", onChange);
        else mq.removeListener(onChange);
      };
    }

    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, setTheme]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("theme", theme);
    } catch { }
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
    }
    setResolvedTheme(theme);
  }, [theme]);

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
