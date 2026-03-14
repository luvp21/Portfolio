import { NextResponse } from "next/server";

// Ahmedabad, India
const LAT = 23.02;
const LON = 72.57;

export async function GET() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,is_day&timezone=Asia/Kolkata`;
        const res = await fetch(url, {
            next: { revalidate: 1800 }, // cache 30 min
        });

        if (!res.ok) return NextResponse.json({ error: "Failed to fetch weather" }, { status: 502 });

        const data = await res.json();
        const c = data.current;

        return NextResponse.json({
            temp: Math.round(c.temperature_2m),
            code: c.weather_code as number,
            isDay: c.is_day === 1,
        });
    } catch {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
