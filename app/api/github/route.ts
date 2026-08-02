import { NextResponse } from "next/server";

const GITHUB_USERNAME = "luvp21";

// github-contributions-api.jogruber.de resolves to an IPv6-only address in
// some network environments; an unbounded fetch there can hang for the
// full connect-timeout (10s+) before failing. Bound each upstream call so a
// single flaky host degrades gracefully instead of stalling the whole panel.
const FETCH_TIMEOUT_MS = 5000;

export async function GET() {
    const [profileResult, contribResult] = await Promise.allSettled([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
            headers: { Accept: "application/vnd.github+json" },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        }),
        fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`, {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        }),
    ]);

    if (profileResult.status !== "fulfilled" || !profileResult.value.ok) {
        return NextResponse.json({ error: "Failed to fetch GitHub profile" }, { status: 502 });
    }

    let profile: any;
    try {
        profile = await profileResult.value.json();
    } catch {
        return NextResponse.json({ error: "Failed to fetch GitHub profile" }, { status: 502 });
    }

    let contribData: any = null;
    if (contribResult.status === "fulfilled" && contribResult.value.ok) {
        try {
            contribData = await contribResult.value.json();
        } catch {
            // Contribution graph is optional — profile stats still render without it.
        }
    }

    // Take the last 53 weeks (371 days) of contributions
    const allContribs: { date: string; count: number; level: number }[] = contribData?.contributions ?? [];
    const last371 = allContribs.slice(-371);

    return NextResponse.json({
        login: profile.login,
        name: profile.name ?? profile.login,
        avatar: profile.avatar_url,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        totalContributions: contribData?.total?.lastYear ?? 0,
        contributions: last371,
    });
}
