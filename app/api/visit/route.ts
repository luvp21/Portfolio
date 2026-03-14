// app/api/visit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parse, serialize } from "cookie"; // <- named imports

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: { persistSession: false },
        global: {
            fetch: (url, opts) =>
                fetch(url, { ...opts, signal: AbortSignal.timeout(5000) }),
        },
    }
);

const COOKIE_NAME = "VISITED_TODAY";
const TARGET_NAME = "main";

function today() {
    return new Date().toISOString().slice(0, 10);
}

export async function GET() {
    try {
        const { data } = await supabaseAdmin
            .from("visit_counters")
            .select("count")
            .eq("name", TARGET_NAME)
            .single();
        return NextResponse.json({ count: Number(data?.count ?? 0) });
    } catch {
        return NextResponse.json({ count: 0 });
    }
}

export async function POST(request: Request) {
    // parse cookies from incoming request header (use named parse)
    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookies = parse(cookieHeader);
    const todayStr = today();

    const already = cookies[COOKIE_NAME] === todayStr;

    let count = 0;

    try {
        if (!already) {
            // atomic increment via RPC
            const { data, error } = await supabaseAdmin.rpc("increment_visit_counter", { p_name: TARGET_NAME });
            if (error) {
                console.error("RPC increment error:", error);
            } else {
                count = Number(data ?? 0);
            }
        } else {
            // just fetch current value
            const { data } = await supabaseAdmin
                .from("visit_counters")
                .select("count")
                .eq("name", TARGET_NAME)
                .single();
            count = Number(data?.count ?? 0);
        }
    } catch (err) {
        console.error("Visit POST network error:", err);
    }

    // prepare Set-Cookie header using named serialize
    const cookieValue = serialize(COOKIE_NAME, todayStr, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
    });

    return NextResponse.json(
        { count },
        {
            headers: {
                "Set-Cookie": cookieValue,
            },
        }
    );
}
