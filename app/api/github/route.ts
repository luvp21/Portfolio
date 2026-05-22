import { NextResponse } from "next/server";

const GITHUB_USERNAME = "luvp21";

export async function GET() {
    try {
        const [profileRes, contribRes] = await Promise.all([
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
                headers: { Accept: "application/vnd.github+json" },
                next: { revalidate: 3600 },
            }),
            fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`, {
                next: { revalidate: 3600 },
            }),
        ]);

        if (!profileRes.ok) return NextResponse.json({ error: "Failed to fetch GitHub profile" }, { status: 502 });

        const profile = await profileRes.json();
        const contribData = contribRes.ok ? await contribRes.json() : null;

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
    } catch {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
