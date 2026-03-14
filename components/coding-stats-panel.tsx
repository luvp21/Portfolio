"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, CheckCircle2, Circle, Clock } from "lucide-react";
import {
    eachDayOfInterval,
    formatISO,
    getDay,
    getMonth,
    nextDay,
    parseISO,
    subWeeks,
} from "date-fns";

// ── Heatmap constants ────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BLOCK = 17;
const MARGIN = 3;
const STEP = BLOCK + MARGIN;
const WEEKS = 42;
const FONT_SIZE = 14;
const LABEL_HEIGHT = FONT_SIZE + 10;
const SVG_HEIGHT = LABEL_HEIGHT + 7 * STEP - MARGIN;
const LEVEL_OPACITY = [0.06, 0.22, 0.42, 0.62, 0.85];

// ── LeetCode constants ───────────────────────────────────────────────────────
const DIFF_MAP = [
    { key: "easy", label: "Easy", bg: "bg-[#00b8a3]/10", text: "text-[#00b8a3]" },
    { key: "medium", label: "Med", bg: "bg-[#ffa116]/10", text: "text-[#ffa116]" },
    { key: "hard", label: "Hard", bg: "bg-[#ff375f]/10", text: "text-[#ff375f]" },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────
function toLevel(count: number): number {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
}

interface DayCell {
    date: string;
    level: number;
    ghCount: number;
    lcCount: number;
}

// ── Component ────────────────────────────────────────────────────────────────
export function CodingStatsPanel() {
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alignedStart =
            getDay(today) === 0
                ? subWeeks(today, WEEKS - 1)
                : subWeeks(nextDay(today, 0), WEEKS - 1);

        const allDays = eachDayOfInterval({ start: alignedStart, end: today });
        const padBefore = getDay(alignedStart);
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

        const weeks: (DayCell | null)[][] = [];
        for (let w = 0; w < Math.ceil(padded.length / 7); w++) {
            weeks.push(padded.slice(w * 7, w * 7 + 7));
        }

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
        const monthLabels = rawLabels.filter(({ weekIndex }, i, arr) => {
            if (i === 0) return arr[1] ? arr[1].weekIndex - weekIndex >= 3 : true;
            if (i === arr.length - 1) return weeks.length - weekIndex >= 3;
            return true;
        });

        let tLC = 0;
        for (const v of Object.values(lcMap)) tLC += Number(v);

        return { weeks, monthLabels, totalGH: ghData?.totalContributions ?? 0, totalLC: tLC };
    }, [ghData, lcData]);

    const svgWidth = weeks.length * STEP - MARGIN;

    if (loading) {
        return (
            <div className="rounded-lg border border-border bg-card/80 shadow-md pointer-events-auto select-none flex animate-pulse">
                <div className="w-[210px] shrink-0 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-3 bg-muted rounded w-3/4" />
                            <div className="h-2.5 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                    <div className="h-2.5 bg-muted rounded w-full" />
                    <div className="border-t border-border" />
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-3 bg-muted rounded w-3/4" />
                            <div className="h-2.5 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                    <div className="h-7 bg-muted rounded" />
                </div>
                <div className="border-l border-border" />
                <div className="flex-1 p-4 space-y-2">
                    <div className="h-2.5 bg-muted rounded w-1/4" />
                    <div className="rounded bg-muted-foreground/5" style={{ height: SVG_HEIGHT }} />
                    <div className="h-2.5 bg-muted rounded w-2/3" />
                </div>
            </div>
        );
    }

    if (!ghData && !lcData) return null;

    // Daily question helpers
    const daily = lcData?.daily ?? null;
    const diff = daily ? DIFF_MAP.find((d) => d.key === daily.difficulty?.toLowerCase()) : null;
    const DailyIcon =
        daily?.status === "Finish" ? CheckCircle2 :
            daily?.status === "Attempted" ? Clock : Circle;
    const dailyIconColor =
        daily?.status === "Finish" ? "text-[#00b8a3]" :
            daily?.status === "Attempted" ? "text-[#ffa116]" : "text-muted-foreground";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full bg-card/80 pointer-events-auto select-none flex px-4"
        >
            {/* ── Left column ──────────────────────────────────────────────── */}
            <div className="flex flex-col w-[260px] shrink-0">

                {/* GitHub section */}
                {ghData && (
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="min-w-0">
                                <a
                                    href={`https://github.com/${ghData.login}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground text-base font-semibold leading-none truncate hover:text-emerald-500 transition-colors block"
                                >
                                    {ghData.name}
                                </a>
                                <p className="text-muted-foreground text-sm leading-none mt-1.5">
                                    @{ghData.login}
                                </p>
                            </div>
                            <div className="shrink-0">
                                <img src="/icons/github-mark.svg" alt="GitHub" className="w-5 h-5 dark:hidden" />
                                <img src="/icons/github-mark-white.svg" alt="GitHub" className="w-5 h-5 hidden dark:block" />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-muted-foreground text-xs">
                                <span className="text-foreground font-semibold">{ghData.publicRepos}</span> repos
                            </span>
                            <span className="text-border text-xs">·</span>
                            <span className="text-muted-foreground text-xs">
                                <span className="text-foreground font-semibold">{ghData.followers}</span> followers
                            </span>
                            <span className="text-border text-xs">·</span>
                            <span className="text-muted-foreground text-xs">
                                <span className="text-foreground font-semibold">{ghData.totalContributions}</span> this year
                            </span>
                        </div>
                    </div>
                )}

                {/* Divider between GH and LC */}
                <div className="border-t border-border" />

                {/* LeetCode section */}
                {lcData && (
                    <div className="px-5 py-4 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0">
                                <a
                                    href={`https://leetcode.com/u/${lcData.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground text-base font-semibold leading-none truncate hover:text-[#ffa116] transition-colors block"
                                >
                                    {lcData.username}
                                </a>
                                <p className="text-muted-foreground text-sm leading-none mt-1.5">
                                    {lcData.topPercent != null
                                        ? `top ${lcData.topPercent}%`
                                        : `#${lcData.ranking?.toLocaleString()}`}
                                </p>
                            </div>
                            <img src="/icons/leetcode.svg" alt="LeetCode" className="w-5 h-5 shrink-0" />
                        </div>

                        {/* Streak + Contest */}
                        {(lcData.streak > 0 || lcData.contest) && (
                            <div className="flex items-center gap-3">
                                {lcData.streak > 0 && (
                                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <Flame size={13} className="text-[#ffa116] shrink-0" />
                                        <span className="text-foreground font-semibold">{lcData.streak}</span> streak
                                    </span>
                                )}
                                {lcData.streak > 0 && lcData.contest && (
                                    <span className="text-border text-xs">·</span>
                                )}
                                {lcData.contest && (
                                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <Trophy size={13} className="text-[#ffa116] shrink-0" />
                                        <span className="text-foreground font-semibold">{lcData.contest.rating}</span> rating
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Daily question */}
                        {daily && (
                            <a
                                href={daily.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 hover:bg-muted/70 transition-colors group"
                            >
                                <DailyIcon size={13} className={`shrink-0 ${dailyIconColor}`} />
                                <span className="text-foreground text-xs leading-tight truncate flex-1 group-hover:text-[#ffa116] transition-colors">
                                    {daily.title}
                                </span>
                                {diff && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${diff.bg} ${diff.text}`}>
                                        {diff.label}
                                    </span>
                                )}
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* ── Vertical divider ─────────────────────────────────────────── */}
            <div className="border-l border-border" />

            {/* ── Right column: Heatmap ────────────────────────────────────── */}
            <div className="flex flex-col justify-between flex-1 min-w-0 px-3 py-3.5">
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
                                return (
                                    <rect
                                        key={day.date}
                                        fill="currentColor"
                                        fillOpacity={LEVEL_OPACITY[day.level]}
                                        x={wi * STEP}
                                        y={LABEL_HEIGHT + di * STEP}
                                        width={BLOCK}
                                        height={BLOCK}
                                        rx={2}
                                        ry={2}
                                    >
                                        <title>
                                            {day.date}
                                            {day.ghCount ? ` · ${day.ghCount} GH` : ""}
                                            {day.lcCount ? ` · ${day.lcCount} LC` : ""}
                                        </title>
                                    </rect>
                                );
                            })
                        )}
                    </svg>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-1 whitespace-nowrap">
                    <p className="text-[12px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{totalGH.toLocaleString()}</span> contributions
                        {" · "}
                        <span className="font-semibold text-foreground">{totalLC}</span> submissions
                    </p>

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
            </div>
        </motion.div>
    );
}
