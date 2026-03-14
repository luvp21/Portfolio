"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, CheckCircle2, Circle, Clock } from "lucide-react";

interface LeetCodeData {
    username: string;
    avatar: string;
    ranking: number;
    topPercent: number | null;
    streak: number;
    totalActiveDays: number;
    solved: { total: number; easy: number; medium: number; hard: number };
    contest: { rating: number; globalRanking: number; attended: number } | null;
    daily: { title: string; difficulty: string; link: string; status: "NotStart" | "Attempted" | "Finish" } | null;
}

const DIFF = [
    { key: "easy", label: "Easy", color: "#00b8a3", bg: "bg-[#00b8a3]/10", text: "text-[#00b8a3]" },
    { key: "medium", label: "Med", color: "#ffa116", bg: "bg-[#ffa116]/10", text: "text-[#ffa116]" },
    { key: "hard", label: "Hard", color: "#ff375f", bg: "bg-[#ff375f]/10", text: "text-[#ff375f]" },
] as const;

// Total problems approx counts (for progress ring)
const TOTALS = { easy: 854, medium: 1800, hard: 796 };

function Ring({ pct, color, size = 56, stroke = 5 }: { pct: number; color: string; size?: number; stroke?: number }) {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/40" />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
        </svg>
    );
}

export function LeetCodeStats() {
    const [data, setData] = useState<LeetCodeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/leetcode")
            .then((r) => r.json())
            .then((d) => { if (!d.error) setData(d); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="w-[260px] rounded-lg border border-border bg-card/80 px-4 py-3.5 shadow-md animate-pulse">
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
            </div>
        );
    }

    if (!data) return null;

    const totalPct = data.solved.total / (TOTALS.easy + TOTALS.medium + TOTALS.hard);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-[260px] rounded-lg border border-border bg-card/80 backdrop-blur-md px-4 py-3.5 shadow-md pointer-events-auto select-none"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <a href={`https://leetcode.com/u/${data.username}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img src={data.avatar} alt={data.username} className="w-11 h-11 rounded-full object-cover hover:opacity-80 transition-opacity" />
                    </a>
                    <div className="min-w-0">
                        <a
                            href={`https://leetcode.com/u/${data.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground text-base font-semibold leading-none truncate hover:text-[#ffa116] transition-colors"
                        >
                            {data.username}
                        </a>
                        <p className="text-muted-foreground text-xs leading-none mt-1">{data.topPercent != null ? `top ${data.topPercent}%` : `#${data.ranking.toLocaleString()}`}</p>
                    </div>
                </div>
                <img src="/icons/leetcode.svg" alt="LeetCode" className="w-5 h-5 shrink-0" />
            </div>

            {/* Streak + Contest */}
            {(data.streak > 0 || data.contest) && (
                <>
                    <div className="border-t border-border mt-3 mb-2" />
                    <div className="flex items-center gap-2">
                        {data.streak > 0 && (
                            <div className="flex items-center gap-1 rounded-md bg-muted/40 px-2 py-1.5 flex-1">
                                <Flame size={12} className="text-[#ffa116] shrink-0" />
                                <span className="text-foreground text-xs font-semibold">{data.streak}</span>
                                <span className="text-muted-foreground text-[10px]">day streak</span>
                            </div>
                        )}
                        {data.contest && (
                            <div className="flex items-center gap-1 rounded-md bg-muted/40 px-2 py-1.5 flex-1">
                                <Trophy size={12} className="text-[#ffa116] shrink-0" />
                                <span className="text-foreground text-xs font-semibold">{data.contest.rating}</span>
                                <span className="text-muted-foreground text-[10px]">rating</span>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Daily Question */}
            {data.daily && (() => {
                const diff = DIFF.find(d => d.key === data.daily!.difficulty.toLowerCase());
                const Icon = data.daily.status === "Finish" ? CheckCircle2 : data.daily.status === "Attempted" ? Clock : Circle;
                const iconColor = data.daily.status === "Finish" ? "text-[#00b8a3]" : data.daily.status === "Attempted" ? "text-[#ffa116]" : "text-muted-foreground";
                return (
                    <>
                        <div className="border-t border-border mt-3 mb-2" />
                        <a
                            href={data.daily.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 hover:bg-muted/70 transition-colors group"
                        >
                            <Icon size={13} className={`shrink-0 ${iconColor}`} />
                            <span className="text-foreground text-[11px] leading-tight truncate flex-1 group-hover:text-[#ffa116] transition-colors">{data.daily.title}</span>
                            {diff && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${diff.bg} ${diff.text}`}>
                                    {diff.label}
                                </span>
                            )}
                        </a>
                    </>
                );
            })()}
        </motion.div>
    );
}
