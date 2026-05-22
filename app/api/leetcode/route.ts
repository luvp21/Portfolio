import { NextResponse } from "next/server";

const LEETCODE_USERNAME = "luvv21";

const QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      ranking
      userAvatar
      realName
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
    userCalendar {
      streak
      totalActiveDays
      submissionCalendar
    }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
    attendedContestsCount
    topPercentage
  }
  activeDailyCodingChallengeQuestion {
    date
    userStatus
    link
    question {
      title
      difficulty
    }
  }
}`;

export async function GET() {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({ query: QUERY, variables: { username: LEETCODE_USERNAME } }),
      next: { revalidate: 300 }, // cache for 1 hour
    });

    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });

    const json = await res.json();
    const user = json?.data?.matchedUser;
    const contest = json?.data?.userContestRanking;
    const daily = json?.data?.activeDailyCodingChallengeQuestion;

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const stats = user.submitStats.acSubmissionNum;
    const total = stats.find((s: any) => s.difficulty === "All")?.count ?? 0;
    const easy = stats.find((s: any) => s.difficulty === "Easy")?.count ?? 0;
    const medium = stats.find((s: any) => s.difficulty === "Medium")?.count ?? 0;
    const hard = stats.find((s: any) => s.difficulty === "Hard")?.count ?? 0;

    return NextResponse.json({
      username: user.username,
      avatar: user.profile.userAvatar,
      ranking: user.profile.ranking,
      topPercent: contest?.topPercentage != null ? parseFloat(contest.topPercentage.toFixed(2)) : null,
      streak: user.userCalendar?.streak ?? 0,
      totalActiveDays: user.userCalendar?.totalActiveDays ?? 0,
      submissionCalendar: (() => {
        try { return JSON.parse(user.userCalendar?.submissionCalendar ?? "{}"); }
        catch { return {}; }
      })(),
      solved: { total, easy, medium, hard },
      contest: contest
        ? {
          rating: Math.round(contest.rating),
          globalRanking: contest.globalRanking,
          attended: contest.attendedContestsCount,
        }
        : null,
      daily: daily
        ? {
          title: daily.question.title,
          difficulty: daily.question.difficulty,
          link: `https://leetcode.com${daily.link}`,
          status: daily.userStatus as "NotStart" | "Attempted" | "Finish",
        }
        : null,
    });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
