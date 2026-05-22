"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GitHubData {
    login: string;
    name: string;
    avatar: string;
    publicRepos: number;
    followers: number;
    totalContributions: number;
    contributions: { date: string; count: number; level: number }[];
}

export function GitHubStats() {
    const [data, setData] = useState<GitHubData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/github")
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
                    <a href={`https://github.com/${data.login}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img
                            src={data.avatar}
                            alt={data.login}
                            className="w-11 h-11 rounded-full object-cover hover:opacity-80 transition-opacity"
                        />
                    </a>
                    <div className="min-w-0">
                        <a
                            href={`https://github.com/${data.login}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground text-base font-semibold leading-none truncate hover:text-emerald-500 transition-colors block"
                        >
                            {data.name}
                        </a>
                        <p className="text-muted-foreground text-xs leading-none mt-1">@{data.login}</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <img src="/icons/github-mark.svg" alt="GitHub" className="w-5 h-5 dark:hidden" />
                    <img src="/icons/github-mark-white.svg" alt="GitHub" className="w-5 h-5 hidden dark:block" />
                </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-[11px]">
                    <span className="text-foreground font-semibold">{data.publicRepos}</span> repos
                </span>
                <span className="text-border">·</span>
                <span className="text-muted-foreground text-[11px]">
                    <span className="text-foreground font-semibold">{data.followers}</span> followers
                </span>
                <span className="text-border">·</span>
                <span className="text-muted-foreground text-[11px]">
                    <span className="text-foreground font-semibold">{data.totalContributions}</span> this yr
                </span>
            </div>
        </motion.div>
    );
}



