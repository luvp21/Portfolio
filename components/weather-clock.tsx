"use client";
import { useEffect, useState } from "react";

function getISTFields(date: Date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const get = (type: string) =>
        Number(parts.find((p) => p.type === type)?.value ?? "0");

    return { seconds: get("second") };
}

function formatIST(date: Date): string {
    try {
        return new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
        }).format(date);
    } catch {
        return "--:--:--";
    }
}

export function WeatherClock() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | undefined;

        const timeoutId = setTimeout(() => {
            setNow(new Date());
            intervalId = setInterval(() => setNow(new Date()), 1000);
        }, 1000 - (Date.now() % 1000));

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, []);

    const { seconds } = getISTFields(now);

    const theta = (seconds / 60) * 2 * Math.PI;
    const deg = Math.round((theta * 180) / Math.PI);

    return (
        <div className="bg-card/80 backdrop-blur-md px-4 py-2 pointer-events-auto select-none font-mono">
            <div className="text-foreground text-[11px] sm:text-sm font-medium tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="text-foreground">θ = {theta.toFixed(2)}rad · {deg}°</span>
                <span className="text-foreground px-2">|</span>
                <span>{formatIST(now)} IST</span>
            </div>
        </div>
    );
}
