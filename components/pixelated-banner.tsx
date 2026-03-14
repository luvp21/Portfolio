"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { CodingStatsPanel } from "@/components/coding-stats-panel";
import { TypingTester } from "@/components/typing-tester";
import { WeatherClock } from "@/components/weather-clock";
import { DiscordPresence } from "@/components/discord-presence";
import { ArrowUpRight } from "lucide-react";
import { PERSONAL, BANNER_SOCIALS } from "@/lib/data";

interface PixelatedBannerProps {
  isBlurred?: boolean;
  className?: string;
}



export function PixelatedBanner({
  isBlurred = false,
  className,
}: PixelatedBannerProps) {


  const STRIPE = {
    backgroundImage:
      "repeating-linear-gradient(135deg, transparent, transparent 6px, currentColor 8px, currentColor 6px)",
    opacity: 0.2,
  };



  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none z-0 overflow-hidden",
        className
      )}
    >


      {/* ── 2-column flex layout ── */}
      <div className="absolute inset-0 flex">

        {/* ── LEFT (main): README + WeatherClock + bottom stats ── */}
        <div className="flex-1 min-w-0 flex flex-col pt-[2%] pl-[2%] pr-[2%]">
          {/* Top: README header + WeatherClock side by side */}
          <div className="flex items-start justify-between gap-6">
            <div className="border-l-[5px] border-foreground pl-5 pt-1 shrink-0 max-w-[60%] pointer-events-auto select-text">
              <p className="text-foreground font-mono mb-4 tracking-wide text-sm xl:text-base">
                {PERSONAL.readmePath}
              </p>
              <p
                className="gaegu-text text-foreground leading-tight"
                style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)" }}
              >
                {PERSONAL.headline[0]}
              </p>
              <p
                className="gaegu-text text-foreground leading-tight -mt-2"
                style={{ fontSize: "clamp(1.8rem, 4.5vw, 4rem)" }}
              >
                {PERSONAL.headline[1]}
              </p>
              <p
                className="gaegu-text text-muted-foreground leading-relaxed"
                style={{ fontSize: "clamp(0.85rem, 1.4vw, 1.25rem)" }}
              >
                {PERSONAL.bannerBio}
              </p>

            </div>
            <div className="shrink-0">
              <WeatherClock />
            </div>
          </div>

          {/* ── Horizontal stripe — left section only ── */}
          <div
            className="hidden lg:block pointer-events-none border-y border-foreground -ml-8 -mr-8 mt-[clamp(20px,5vh,56px)]"
            style={{
              height: "25px",
              ...STRIPE,
            }}
          />

          {/* Bottom: stats + typing row */}
          <div className="hidden lg:flex flex-col">
            <div className="-mx-[3%] border-t border-b border-foreground/20">
              <CodingStatsPanel />
            </div>
            {/* Typing tester + More Detail */}
            <div className="flex items-stretch ">
              <div className="w-[40%] pointer-events-auto pt-[1%] pr-2 border-r border-foreground/20">
                <TypingTester />
              </div>
              <div
                className="flex-1 -mr-7 flex items-center justify-center select-none border-l border-foreground/20 min-h-full h-full overflow-hidden"
                style={{
                  backgroundColor: "hsl(var(--card))",
                  backgroundImage: "radial-gradient(rgba(100,100,100,0.4) 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              >
                <img
                  src="/more_detail.svg"
                  alt="More Detail"
                  className="w-[240px] max-w-[90%] h-auto opacity-60 -mr-16 -mb-6 dark:invert dark:opacity-50"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Vertical stripe ── */}
        <div
          className="w-5 shrink-0 self-stretch border-x border-foreground"
          style={{
            width: "25px",
            ...STRIPE,
          }}
        />

        {/* ── RIGHT: Discord + Socials ── */}
        <div className="w-[clamp(220px,24%,340px)] shrink-0 flex flex-col py-[2%] pointer-events-auto gap-3 border-t border-b border-r border-foreground/30">
          <DiscordPresence />
          <div className="flex flex-col">
            {BANNER_SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 border-y border-border/50 bg-card/30 hover:bg-card/60 transition-colors group w-full"
              >
                <div className={cn("w-8 h-8 rounded flex items-center justify-center shrink-0", s.bgClass)}>
                  {s.icon}
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{s.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            ))}
          </div>
          <div
            className="w-full flex-1 min-h-0 flex items-center justify-center -mt-3 -mb-8 overflow-hidden"
            style={{
              backgroundColor: "hsl(var(--card))",
              backgroundImage: "radial-gradient(rgba(100,100,100,0.4) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          >
            <img
              src="/follow_me.svg"
              alt="Follow me"
              className="w-[220px] max-w-[90%] h-36 -mt-1 opacity-60 dark:invert dark:opacity-50"
              loading="lazy"
            />
          </div>

        </div>
      </div>

      {/* ── Blur/dim overlay (avoids filter on parent which blacks out backdrop-filter children) ── */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none backdrop-blur-sm bg-background/50 transition-opacity duration-700 ease-in-out",
          isBlurred ? "opacity-100" : "opacity-0"
        )}
      />

    </div>
  );
}
