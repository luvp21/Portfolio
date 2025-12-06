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
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: Theme;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
});

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

function applyThemeToDocument(t: Theme) {
  if (typeof document === "undefined") return;

  if (t === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useResponsive();

  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setResolvedTheme(newTheme);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("theme", newTheme);
      } catch {}
    }

    applyThemeToDocument(newTheme);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getStoredTheme = (): Theme | null => {
      try {
        const stored = localStorage.getItem("theme");
        if (stored === "light" || stored === "dark") return stored;
        return null;
      } catch {
        return null;
      }
    };

    const stored = getStoredTheme();

    if (stored) {
      setThemeState(stored);
      setResolvedTheme(stored);
      applyThemeToDocument(stored);
    } else {
      // FORCE LIGHT AS DEFAULT ALWAYS
      const initial: Theme = "light";
      setThemeState(initial);
      setResolvedTheme(initial);
      applyThemeToDocument(initial);
    }
  }, [isMobile]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
