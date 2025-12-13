"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";



interface PixelatedBannerProps {
  isHidden?: boolean;
  headerHeight?: string;
  clockIntervalMs?: number;
  className?: string;
  minFontSizePx?: number;
  maxFontSizePx?: number;
  /** container width bounds (CSS length or number px) */
  minContainerWidth?: number; // px
  maxContainerWidth?: number; // px
}

export function PixelatedBanner({
  isHidden = false,
  headerHeight = "4rem",
  clockIntervalMs = 1000,
  className,
  // font-size clamp
  minFontSizePx = 32,
  maxFontSizePx = 72,
  // container width bounds
  minContainerWidth = 480, // don't go narrower than this (px)
  maxContainerWidth = 1200, // don't go wider than this (px)
}: PixelatedBannerProps) {
  const gap = "0.5rem";
  const belowHeaderStyle = { top: `calc(${headerHeight} + ${gap})` } as React.CSSProperties;

  // Live IST clock
  const [istTime, setIstTime] = useState<string>(() => formatIST(new Date()));
  useEffect(() => {
    const id = setInterval(() => setIstTime(formatIST(new Date())), clockIntervalMs);
    return () => clearInterval(id);
  }, [clockIntervalMs]);

  // fit-to-one-line logic
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const [fontPx, setFontPx] = useState<number>(maxFontSizePx);

  // compute bounded container width (in px) to measure against
  const getBoundedContainerWidth = () => {
    const container = titleContainerRef.current;
    if (!container) {
      // fallback to viewport width minus safe padding
      return Math.max(minContainerWidth, Math.min(maxContainerWidth, window.innerWidth - 160));
    }

    // preferred width is the computed CSS width of the container element
    const style = window.getComputedStyle(container);
    // parse px width if available, otherwise fallback to clientWidth
    const parsed = parseFloat(style.width);
    const rawWidth = Number.isFinite(parsed) && parsed > 0 ? parsed : container.clientWidth;

    // keep it inside [minContainerWidth, maxContainerWidth] and viewport (90vw)
    const viewportMax = Math.round(window.innerWidth * 0.9);
    const bounded = Math.max(minContainerWidth, Math.min(maxContainerWidth, Math.min(rawWidth, viewportMax)));
    return bounded;
  };

  // try to fit in one line by reducing font size in fractional steps (0.5px)
  const fitToOneLine = () => {
    const el = titleRef.current;
    const container = titleContainerRef.current;
    if (!el || !container) return;

    let current = maxFontSizePx;
    el.style.fontSize = `${current}px`;
    el.style.whiteSpace = "nowrap"; // measure single-line width

    // use the bounded container width as measurement target
    const containerWidth = getBoundedContainerWidth() - 24; // small tolerance/padding

    // quick accept if already fits
    if (el.scrollWidth <= containerWidth) {
      setFontPx(current);
      el.style.whiteSpace = "nowrap";
      return;
    }

    // decrease in 0.5px steps until it fits or we reach min
    while (current > minFontSizePx + 0.001) {
      current = Math.round((current - 0.5) * 100) / 100;
      el.style.fontSize = `${current}px`;
      if (el.scrollWidth <= containerWidth) {
        setFontPx(current);
        el.style.whiteSpace = "nowrap";
        return;
      }
    }

    // Couldn't fit at min — allow wrapping but keep at min size for readability
    el.style.whiteSpace = "normal";
    setFontPx(minFontSizePx);
  };

  // run on mount + resize + when container bounds change
  useEffect(() => {
    fitToOneLine();

    let rafId: number | null = null;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => fitToOneLine());
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minFontSizePx, maxFontSizePx, minContainerWidth, maxContainerWidth]);

  // inline style for title container that enforces min/max width (responsive)
  const titleContainerStyle: React.CSSProperties = {
    width: "min(90vw, " + `${maxContainerWidth}px` + ")",
    minWidth: `${minContainerWidth}px`,
    marginInline: "auto",
  };

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-10 overflow-hidden transition-opacity duration-300",
        isHidden && "opacity-0",
        className
      )}
    >
      {/* Avatar (kept near title area) */}
      <div
        className="absolute -translate-y-0"
        style={{
          ...belowHeaderStyle,
          left: "4%",
          top: "14%",
          transform: "translateY(-6px) rotate(-12deg)",
        } as React.CSSProperties}
      >
        <img
          src="/pp.png"
          alt="Profile"
          className="w-32 h-32 md:w-36 md:h-36 bg-blue-300 rounded-full shadow-lg object-cover"
        />
      </div>

      {/* Clock */}
      <div className="absolute right-8" style={belowHeaderStyle}>
        <div aria-live="polite" className="text-sm md:text-base text-foreground/60 font-mono select-none">
          {istTime} IST
        </div>
      </div>

      {/* Title container (bounded width so the text never overflows viewport) */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div ref={titleContainerRef} className="relative text-center" style={titleContainerStyle}>
          <h1
            ref={titleRef}
            style={{ fontSize: `${fontPx}px` }}
            className={cn("pixelated-text text-foreground/30 dark:text-foreground/20 leading-tight select-none", "tracking-[0.03em]")}
          >
            Hi, I'm Luv — A Full Stack web developer.
          </h1>

          {/* Right bubble: move it a bit inward to avoid pushing off-screen */}
          {/* <div className="absolute -top-6 right-[-80px] md:right-[-120px] lg:right-[-60px]">
            <div className="relative rotate-[12deg]">
              <div className="absolute inset-0 border-[3px] border-black/80 dark:border-white/70 rounded-[50%] scale-[1.25] pointer-events-none"></div>
              <p className="px-2 py-2 text-xs md:text-sm pixelated-text-small text-foreground/70 dark:text-foreground/40 select-none whitespace-nowrap">
                press / for ?
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Bottom-right visitor text — note pointer-events-auto so it can be interactive even though parent has pointer-events-none */}
      <div
        className="pointer-events-auto z-[9999] hidden sm:block"
        // inline style uses safe-area inset + fallback spacing so it won't overlap
        style={{
          right: "1.5rem",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)", // push above footer
          position: "absolute",
        }}
      >
        {/* <div className="flex items-center gap-2 text-sm md:text-base font-mono text-foreground/70 dark:text-foreground/50 select-none">
          <LiveVisitorBadge incrementOnMount={true} />

        </div> */}
      </div>
    </div>
  );
}

/** Helper to format a Date to "H:MM" in Asia/Kolkata timezone */
function formatIST(date: Date) {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    return fmt.format(date);
  } catch (e) {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
    const h = ist.getHours();
    const m = ist.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }
}
