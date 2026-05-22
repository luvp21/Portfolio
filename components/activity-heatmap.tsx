"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    eachDayOfInterval,
    formatISO,
    getDay,
    getMonth,
    nextDay,
    parseISO,
    subWeeks,
} from "date-fns";

// ── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BLOCK = 12;   // px – cell size
const MARGIN = 3;   // px – gap between cells
const STEP = BLOCK + MARGIN;
const WEEKS = 17;
const FONT_SIZE = 10;
const LABEL_HEIGHT = FONT_SIZE + 6; // label row height + margin
const SVG_HEIGHT = LABEL_HEIGHT + 7 * STEP - MARGIN;

// Grayscale opacity ramp — level 0 (empty) → level 4 (most active)
// Uses SVG fill="currentColor" + fillOpacity so it auto-adapts to dark/light mode
const LEVEL_OPACITY = [0.06, 0.22, 0.42, 0.62, 0.85];

// ── Types ────────────────────────────────────────────────────────────────────
interface DayCell {
    date: string;
    level: number;
    ghCount: number;
    lcCount: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function toLevel(count: number): number {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
}

// ── Component ────────────────────────────────────────────────────────────────
export function ActivityHeatmap() {
    const [ghData, setGhData] = useState<any>(null);
    const [lcData, setLcData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/github").then((r) => r.json()).catch(() => null),
            fetch("/api/leetcode").then((r) => r.json()).catch(() => null),
        ]).then(([gh, lc]) => {
            if (gh && !gh.error) setGhData(gh);
            if (lc && !lc.error) setLcData(lc);
        }).finally(() => setLoading(false));
    }, []);

    const { weeks, monthLabels, totalGH, totalLC } = useMemo(() => {
        // ── Build lookup maps ──
        const ghMap: Record<string, { count: number; level: number }> = {};
        if (ghData?.contributions) {
            for (const c of ghData.contributions) ghMap[c.date] = { count: c.count, level: c.level };
        }

        const lcMap: Record<string, number> = {};
        if (lcData?.submissionCalendar) {
            for (const [ts, cnt] of Object.entries(lcData.submissionCalendar)) {
                const key = formatISO(new Date(Number(ts) * 1000), { representation: "date" });
                lcMap[key] = (lcMap[key] ?? 0) + Number(cnt);
            }
        }

        // ── Build flat day array for the last WEEKS weeks ──
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Align start to the Sunday of the week that is (WEEKS-1) weeks ago
        const startDate = subWeeks(
            nextDay(today, 0), // next Sunday from today (or today if already Sunday)
            WEEKS - 1,
        );
        const alignedStart =
            getDay(today) === 0
                ? subWeeks(today, WEEKS - 1)
                : subWeeks(nextDay(today, 0), WEEKS - 1);

        const allDays = eachDayOfInterval({ start: alignedStart, end: today });

        // Pad front so week 0 starts on Sunday
        const padBefore = getDay(alignedStart); // 0 = Sun → no padding needed
        const padded: (DayCell | null)[] = [
            ...Array(padBefore).fill(null),
            ...allDays.map((d) => {
                const dateStr = formatISO(d, { representation: "date" });
                const gh = ghMap[dateStr] ?? { count: 0, level: 0 };
                const lc = lcMap[dateStr] ?? 0;
                return {
                    date: dateStr,
                    level: Math.min(Math.max(gh.level, toLevel(lc)), 4),
                    ghCount: gh.count,
                    lcCount: lc,
                };
            }),
        ];

        // ── Group into weeks of 7 ──
        const weeks: (DayCell | null)[][] = [];
        for (let w = 0; w < Math.ceil(padded.length / 7); w++) {
            weeks.push(padded.slice(w * 7, w * 7 + 7));
        }

        // ── Month labels (same algorithm as chanhdai) ──
        const rawLabels: { weekIndex: number; label: string }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            const first = week.find(Boolean);
            if (!first) return;
            const month = getMonth(parseISO(first.date));
            if (month !== lastMonth) {
                rawLabels.push({ weekIndex: wi, label: MONTHS[month] });
                lastMonth = month;
            }
        });
        // Filter out labels that are too close to edges (min 3 weeks gap)
        const monthLabels = rawLabels.filter(({ weekIndex }, i, arr) => {
            if (i === 0) return arr[1] ? arr[1].weekIndex - weekIndex >= 3 : true;
            if (i === arr.length - 1) return weeks.length - weekIndex >= 3;
            return true;
        });

        // ── Totals ──
        let tLC = 0;
        for (const v of Object.values(lcMap)) tLC += Number(v);

        return { weeks, monthLabels, totalGH: ghData?.totalContributions ?? 0, totalLC: tLC };
    }, [ghData, lcData]);

    const svgWidth = weeks.length * STEP - MARGIN;

    if (loading) {
        return (
            <div className="rounded-lg border border-border bg-card/80 px-4 py-3.5 animate-pulse pointer-events-auto select-none" style={{ width: svgWidth + 32 }}>
                <div className="h-[10px] w-1/3 rounded bg-muted-foreground/10 mb-2" />
                <div className="rounded bg-muted-foreground/5" style={{ height: SVG_HEIGHT }} />
                <div className="h-[10px] w-2/3 rounded bg-muted-foreground/10 mt-2" />
            </div>
        );
    }

    if (!ghData && !lcData) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-lg border border-border bg-card/80 backdrop-blur-md px-4 py-3.5 shadow-md pointer-events-auto select-none"
        >
            {/* SVG graph */}
            <div className="overflow-x-auto overflow-y-hidden no-scrollbar">
                <svg
                    className="block overflow-visible"
                    width={svgWidth}
                    height={SVG_HEIGHT}
                    viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
                    style={{ fontSize: FONT_SIZE }}
                >
                    <title>Activity Graph</title>

                    {/* Month labels */}
                    <g className="fill-current text-muted-foreground">
                        {monthLabels.map(({ label, weekIndex }) => (
                            <text
                                key={`${label}-${weekIndex}`}
                                x={weekIndex * STEP}
                                dominantBaseline="hanging"
                            >
                                {label}
                            </text>
                        ))}
                    </g>

                    {/* Cells */}
                    {weeks.map((week, wi) =>
                        week.map((day, di) => {
                            if (!day) return null;
                            const x = wi * STEP;
                            const y = LABEL_HEIGHT + di * STEP;
                            return (
                                <rect
                                    key={day.date}
                                    fill="currentColor"
                                    fillOpacity={LEVEL_OPACITY[day.level]}
                                    x={x}
                                    y={y}
                                    width={BLOCK}
                                    height={BLOCK}
                                    rx={2}
                                    ry={2}
                                >
                                    <title>
                                        {day.date}{day.ghCount ? ` · ${day.ghCount} GH` : ""}{day.lcCount ? ` · ${day.lcCount} LC` : ""}
                                    </title>
                                </rect>
                            );
                        })
                    )}
                </svg>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-1 mt-2 whitespace-nowrap" style={{ maxWidth: svgWidth }}>
                <p className="text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{totalGH.toLocaleString()}</span> contributions
                    {" · "}
                    <span className="font-semibold text-foreground">{totalLC}</span> submissions
                </p>

                {/* Legend */}
                <div className="ml-auto flex items-center gap-0.5">
                    <span className="mr-1 text-[10px] text-muted-foreground">Less</span>
                    {LEVEL_OPACITY.map((opacity, level) => (
                        <svg key={level} width={BLOCK} height={BLOCK}>
                            <title>{`Level ${level}`}</title>
                            <rect
                                fill="currentColor"
                                fillOpacity={opacity}
                                width={BLOCK}
                                height={BLOCK}
                                rx={2}
                                ry={2}
                            />
                        </svg>
                    ))}
                    <span className="ml-1 text-[10px] text-muted-foreground">More</span>
                </div>
            </div>
        </motion.div>
    );
}
