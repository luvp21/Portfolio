"use client";

import { useEffect, useState } from "react";
import { SiDiscord, SiSpotify } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";

// ─── Config ───────────────────────────────────────────────────────────────────
const DISCORD_USER_ID = "1131273154367598592";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DiscordUser {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
    display_name?: string;
}

interface Activity {
    name: string;
    type: number; // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 4=Custom, 5=Competing
    state?: string;
    details?: string;
    timestamps?: { start?: number; end?: number };
    assets?: { large_image?: string; large_text?: string; small_image?: string };
}

interface LanyardData {
    discord_user: DiscordUser;
    discord_status: "online" | "idle" | "dnd" | "offline";
    activities: Activity[];
    active_on_discord_desktop: boolean;
    active_on_discord_mobile: boolean;
    active_on_discord_web: boolean;
    listening_to_spotify: boolean;
    spotify?: {
        song: string;
        artist: string;
        album: string;
        album_art_url: string;
        track_id: string;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
    online: "#23a55a",
    idle: "#f0b232",
    dnd: "#f23f43",
    offline: "#80848e",
};

const ACTIVITY_TYPE_LABEL: Record<number, string> = {
    0: "Playing",
    1: "Streaming",
    2: "Listening to",
    3: "Watching",
    5: "Competing in",
};

const STATUS_LABEL: Record<string, string> = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline",
};

function getActivityLabel(activities: Activity[], status: string): string {
    // Filter out custom status (type 4) and Spotify
    const visible = activities.filter((a) => a.type !== 4);
    if (!visible.length) return STATUS_LABEL[status] ?? "Online";
    const a = visible[0];
    const prefix = ACTIVITY_TYPE_LABEL[a.type] ?? "";
    return prefix ? `${prefix} ${a.name}` : a.name;
}

function avatarUrl(user: DiscordUser): string {
    if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "webp"}?size=128`;
    }
    const defaultIndex = Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DiscordSkeleton() {
    return (
        <div className="w-full rounded-xl border border-border bg-card/80 pointer-events-auto select-none overflow-hidden animate-pulse">
            <div className="flex justify-center pt-5 pb-3">
                <div className="w-16 h-16 rounded-full bg-muted" />
            </div>
            <div className="flex items-start justify-between px-4 pb-4">
                <div className="flex flex-col gap-2">
                    backgroundColor: "hsl(var(--muted) / 0.35)",
                    backgroundImage: "radial-gradient(hsl(var(--foreground) / 0.22) 1px, transparent 1px)",
                    <div className="h-3 w-14 rounded bg-muted mt-1" />
                </div>
                <div className="w-5 h-5 rounded bg-muted mt-0.5" />
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DiscordPresence() {
    const [data, setData] = useState<LanyardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!DISCORD_USER_ID) return;

        fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
            .then((r) => r.json())
            .then((json) => {
                if (json?.data) { setData(json.data); setError(false); }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));

        let ws: WebSocket;
        let heartbeatInterval: ReturnType<typeof setInterval>;
        let dead = false;

        function connect() {
            ws = new WebSocket("wss://api.lanyard.rest/socket");
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.op === 1) {
                    heartbeatInterval = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
                    }, msg.d.heartbeat_interval);
                    ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_USER_ID } }));
                }
                if (msg.op === 0) { setData(msg.d); setError(false); setLoading(false); }
            };
            ws.onerror = () => setError(true);
            ws.onclose = () => { clearInterval(heartbeatInterval); if (!dead) setTimeout(connect, 3000); };
        }
        connect();

        return () => { dead = true; clearInterval(heartbeatInterval); ws?.close(); };
    }, []);

    if (!DISCORD_USER_ID) return null;
    if (loading) return <DiscordSkeleton />;
    if (error || !data) return null;

    const { discord_user, discord_status, activities, listening_to_spotify, spotify } = data;
    const statusColor = STATUS_COLOR[discord_status] ?? STATUS_COLOR.offline;
    const displayName = discord_user.global_name ?? discord_user.username;
    const handle = `@${discord_user.username}`;
    const hasActivity = activities.filter((a) => a.type !== 4).length > 0;
    const activityText = listening_to_spotify && spotify
        ? `Listening to ${spotify.song}`
        : getActivityLabel(activities, discord_status);

    return (
        <AnimatePresence>
            <motion.div
                key="discord-presence"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full pointer-events-auto select-none overflow-hidden"
            >
                {/* Big avatar */}
                <div className="flex justify-center border-border/50 pb-3">

                    <a
                        href={`https://discord.com/users/${discord_user.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative"
                    >
                        <img
                            src="/pp.png"
                            alt={displayName}
                            className="w-56 h-56 bg-blue-400 rounded-full object-cover hover:opacity-90 transition-opacity"
                            loading="lazy"
                        />
                        <span
                            className="absolute bottom-4 right-7 w-5 h-5 rounded-full border-[3px] border-card"
                            style={{ backgroundColor: statusColor }}
                        />
                    </a>
                </div>

                {/* Name + handle + Discord logo */}
                <div className="flex items-start justify-between px-4 pt-3">
                    <div className="flex flex-col gap-1">
                        <a
                            href={`https://discord.com/users/${discord_user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-md font-semibold text-foreground leading-none hover:text-[#5865F2] transition-colors"
                        >
                            {displayName}
                        </a>
                        <a
                            href={`https://discord.com/users/${discord_user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-[#5865F2] transition-colors"
                        >
                            {handle}
                        </a>

                    </div>
                    <SiDiscord className="text-[#5865F2] w-6 h-6 shrink-0 mt-0.5" />
                </div>

                {/* Activity section */}
                {/* {((listening_to_spotify && spotify) || hasActivity) && (
                    <div className="border-t border-border px-3 py-3">
                        {listening_to_spotify && spotify ? (
                            <>
                                <div className="flex items-center gap-1 mb-2">
                                    <SiSpotify className="w-3 h-3 text-[#1DB954] shrink-0" />
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Listening to Spotify</p>
                                </div>
                                <div className="flex gap-2.5">
                                    <a
                                        href={`https://open.spotify.com/track/${spotify.track_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0"
                                    >
                                        <img
                                            src={spotify.album_art_url}
                                            alt={spotify.song}
                                            className="w-11 h-11 rounded object-cover hover:opacity-80 transition-opacity"
                                        />
                                    </a>
                                    <div className="min-w-0 flex flex-col justify-center">
                                        <p className="text-foreground text-xs font-semibold leading-none truncate">{spotify.song}</p>
                                        <p className="text-muted-foreground text-[11px] leading-none mt-1 truncate">{spotify.artist}</p>
                                        <p className="text-muted-foreground/60 text-[10px] leading-none mt-0.5 truncate">{spotify.album}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs font-medium text-muted-foreground truncate">{activityText}</p>
                        )}
                    </div>
                )} */}
            </motion.div>
        </AnimatePresence >
    );
}
