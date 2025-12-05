// components/LiveVisitorBadge.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Eye } from "lucide-react";

interface Props {
    incrementOnMount?: boolean;
    className?: string;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LAST_VISIT_KEY = "last_visit_date";
const VISITOR_ID_KEY = "visitor_id";
const TARGET_NAME = "main";

// ------------ Utils ------------
function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function getOrCreateVisitorId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
}

function getOrdinalSuffix(n: number) {
    if (!n) return "";
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    // safe guard: handle special cases for 11,12,13
    if (v >= 11 && v <= 13) return "th";
    return s[(v % 10)] || "th";
}

// ============ COMPONENT ============
export function LiveVisitorBadge({ incrementOnMount = true, className = "" }: Props) {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const didIncrementRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const visitorId = getOrCreateVisitorId();
        const today = todayStr();

        // keep a reference to the channel object (not the subscribe promise)
        const channel = supabase.channel("visit-counter-sub");

        async function init() {
            try {
                // 1. Get current count instantly
                const res = await fetch("/api/visit", { method: "GET", credentials: "same-origin" });
                if (cancelled) return;
                const data = await res.json();
                if (!cancelled) setCount(Number(data.count ?? 0));
                if (!cancelled) setLoading(false);

                // 2. Check if increment needed
                if (!incrementOnMount) return;

                const last = localStorage.getItem(LAST_VISIT_KEY);
                if (last === today) return;

                if (didIncrementRef.current) return;
                didIncrementRef.current = true;

                // 3. Background POST increment
                try {
                    const postRes = await fetch("/api/visit", {
                        method: "POST",
                        headers: {
                            "x-visitor-id": visitorId,
                        },
                        credentials: "same-origin",
                    });

                    if (cancelled) return;
                    const p = await postRes.json();
                    if (!cancelled && typeof p.count === "number") setCount(p.count);

                    localStorage.setItem(LAST_VISIT_KEY, today);
                } catch (err) {
                    if (!cancelled) {
                        console.error("Increment failed:", err);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to fetch visitor count:", err);
                    setLoading(false);
                }
            }
        }

        // start init but don't return the Promise from useEffect
        init();

        // 4. Realtime sync: configure channel then subscribe
        channel.on(
            "postgres_changes",
            { event: "*", schema: "public", table: "visit_counters", filter: `name=eq.${TARGET_NAME}` },
            (payload: any) => {
                if (payload.new?.count !== undefined) {
                    // only update when not cancelled
                    if (!cancelled) setCount(Number(payload.new.count));
                }
            }
        );

        // subscribe (subscribe returns a promise; we don't want to assign that to `channel`)
        const ch = channel.subscribe();
        // read runtime state in a type-safe-ish way
        const state = (ch as unknown as { state?: string }).state;
        if (state && state !== "SUBSCRIBED") {
            console.error("Supabase subscription error:", state);
        }

        // synchronous cleanup
        return () => {
            cancelled = true;
            // remove/unsubscribe channel
            try {
                supabase.removeChannel(channel);
            } catch (e) {
                // fail silently if removeChannel unavailable or errors
                // (keeps runtime robust)
            }
        };
        // only depends on incrementOnMount (other helpers are stable)
    }, [incrementOnMount]);

    return (
        <div
            className={[
                "inline-flex items-center gap-0.5 text-sm font-mono rounded-full px-3",
                className,
            ].join(" ")}
            role="status"
            aria-live="polite"
        >
            {/* Eye Icon Box */}
            <div className="flex items-center justify-center rounded-full bg-muted/10 dark:bg-muted/20 w-8 h-8 pointer-events-none">
                <Eye className="w-4 h-4 text-muted-foreground/70" />
            </div>

            {/* Text Section */}
            <div className="flex items-center gap-2 select-none ">
                <span className="text-foreground">You are the</span>

                <span className="relative font-semibold text-foreground text-base leading-none">
                    {loading ? "…" : count ?? "—"}

                    {/* Superscript suffix */}
                    {!loading && count ? (
                        <span className="absolute -top-0.5 -right-3 text-[10px] text-foreground">
                            {getOrdinalSuffix(count)}
                        </span>
                    ) : null}
                </span>

                <span></span>

                <span className="text-foreground/60">visitor</span>
            </div>
        </div>
    );
}
