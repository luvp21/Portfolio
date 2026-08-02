/**
 * ============================================================
 *  PORTFOLIO DATA — single source of truth
 *  Edit this file to update content across the entire site.
 * ============================================================
 */

import React from "react"
import {
    MapPin,
    GraduationCap,
    Calendar,
    Mail,
} from "lucide-react"
import { FaLinkedin, FaGithub } from "react-icons/fa"
import {
    SiTypescript,
    SiReact,
    SiNextdotjs,
    SiTailwindcss,
    SiGit,
    SiNodedotjs,
    SiHtml5,
    SiSupabase,
} from "react-icons/si"

// ─────────────────────────────────────────────────────────────
//  PERSONAL INFO
// ─────────────────────────────────────────────────────────────
export const PERSONAL = {
    name: "Luv Patel",
    /** Banner README headline lines */
    headline: ["Heyy!", "I'm Luv Patel"],
    /** Short blurb shown in banner */
    bannerBio:
        "I'm a Computer Science student at Nirma University, and I don't always know how… but I end up building it anyway.",
    /** Longer bio shown in the About panel */
    bio: "Pre-final year CS student at Nirma University & AI Intern at Befree Global. I build full-stack products, AI/ML models, and agentic workflows. Passionate about turning ambitious ideas into clean, robust code.",
    avatar: "/pp.png",
    /** Footer / banner path label */
    readmePath: "luvvv.me\u00a0/\u00a0README.md",
}

// ─────────────────────────────────────────────────────────────
//  PROFILE TAGS  (shown under the name in About panel)
// ─────────────────────────────────────────────────────────────
export const PROFILE_TAGS = [
    { icon: <MapPin size={16} />, text: "India" },
    { icon: <GraduationCap size={16} />, text: "Undergraduate" },
    { icon: <Calendar size={16} />, text: "21y/o" },
]

// ─────────────────────────────────────────────────────────────
//  SOCIAL LINKS  (About panel icon row)
// ─────────────────────────────────────────────────────────────
export const PROFILE_LINKS = [
    {
        label: "LinkedIn",
        href: "https://linkedin.com/in/luvv",
        icon: <FaLinkedin size={20} className="text-[#0A66C2]" />,
    },
    {
        label: "GitHub",
        href: "https://github.com/luvp21",
        icon: (
            <>
                <img
                    src="/icons/github-mark.svg"
                    alt="GitHub"
                    className="w-5 h-5 object-contain dark:hidden"
                />
                <img
                    src="/icons/github-mark-white.svg"
                    alt="GitHub"
                    className="w-5 h-5 object-contain hidden dark:block"
                />
            </>
        ),
    },
    {
        label: "Email",
        href: "mailto:luvvvpatel@gmail.com",
        icon: <Mail size={20} className="text-[#f4b267]" />,
    },
    {
        label: "LeetCode",
        href: "https://leetcode.com/u/luvv21/",
        icon: (
            <>
                <img src="/icons/leetcode.svg" alt="LeetCode" className="w-5 h-5 object-contain dark:hidden" />
                <img src="/icons/leetcode-dark.svg" alt="LeetCode" className="w-5 h-5 object-contain hidden dark:block" />
            </>
        ),
    },
    {
        label: "Codeforces",
        href: "https://codeforces.com/profile/luvv",
        icon: <img src="/icons/cf.svg" alt="Codeforces" className="w-5 h-5 object-contain dark:invert" />,
    },
]

// ─────────────────────────────────────────────────────────────
//  BANNER SOCIALS  (right panel in the hero banner)
// ─────────────────────────────────────────────────────────────
export const BANNER_SOCIALS = [
    {
        label: "GitHub",
        href: "https://github.com/luvp21",
        bgClass: "bg-black",
        icon: (
            <img
                src="/icons/github-mark-white.svg"
                alt="GitHub"
                className="w-3.5 h-3.5"
            />
        ),
    },
    {
        label: "LinkedIn",
        href: "https://linkedin.com/in/luvv",
        bgClass: "bg-[#0A66C2]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        label: "X",
        href: "https://x.com/luvp_21",
        bgClass: "bg-black",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.74-8.855L1.254 2.25H8.08l4.261 5.638 5.902-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        label: "LeetCode",
        href: "https://leetcode.com/u/luvv21",
        bgClass: "bg-[#FFA116]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
            </svg>
        ),
    },
]

// ─────────────────────────────────────────────────────────────
//  PROJECTS
// ─────────────────────────────────────────────────────────────
export interface Project {
    title: string
    description: string
    tags: string[]
    image: string
    githubUrl?: string
    liveUrl?: string
}

export const PROJECTS: Project[] = [
    {
        title: "Voice Copilot | AI Restaurant Agent",
        description:
            "Voice AI agent for restaurant operations, built for Petpooja POS (50k+ restaurants). Features Hinglish voice recognition across 12 languages over Twilio WebSockets and a market basket analytics engine. Runner-up at HACKaMINeD.",
        tags: ["TypeScript", "Python", "Fastify", "PostgreSQL", "Docker", "Twilio WebSockets", "Hinglish STT"],
        image: "/voice-copilot.png",
        githubUrl: "https://github.com/luvp21/Voice-Copilot-AI-Restaurant-Agent",
        liveUrl: "", // Add live demo link here if available
    },
    {
        title: "BHOOMI | Satellite Forecasting",
        description:
            "Satellite environmental intelligence platform for Ahmedabad. Ingests data from ISRO Bhuvan, NASA MODIS, and ESA Sentinel. Forecasting via ARIMA, LSTM, and Prophet with LLM-generated PDF reports. Runner-up at Aetrix.",
        tags: ["React", "TypeScript", "Python", "Flask", "PostgreSQL", "PyTorch", "XGBoost", "Mapbox GL", "Deck.gl"],
        image: "/bhoomi.png",
        githubUrl: "https://github.com/luvp21/bhoomi",
        liveUrl: "https://bhoomi-seven.vercel.app", // Add live demo link here if available
    },
    {
        title: "Agentic Honeypot",
        description:
            "LLM-powered anti-fraud system running a 10-turn AI conversation as a victim to extract UPI and bank scammer coordinates. Gemini 2.5 Flash, rule-based fallback, and async callback delivery. Finalist at GUVI-HCL national hackathon.",
        tags: ["Python", "FastAPI", "Google Gemini", "Pydantic", "Docker"],
        image: "/honeypot.png",
        githubUrl: "https://github.com/luvp21/agentic-honeypot",
        liveUrl: "", // Add live demo link here if available
    },
    {
        title: "CollabDraw",
        description:
            "A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style. Supports multiple simultaneous drawers syncing instantly over WebSockets.",
        tags: ["Next.js", "TypeScript", "Express", "WebSockets", "PostgreSQL", "Prisma", "Turborepo"],
        image: "/excalidraw.png",
        githubUrl: "https://github.com/luvp21/CollabDraw",
        liveUrl: "https://collabdraw.luvvv.me",
    },
    {
        title: "DinoSprint – Pixel Endless Runner",
        description:
            "Chrome Dino–style endless runner with leaderboard, unlockable skins, and session stats.",
        tags: ["Vite", "TypeScript", "React", "Tailwind", "Supabase", "Vercel"],
        image: "/Dino.png",
        githubUrl: "https://github.com/luvp21/Dino",
        liveUrl: "https://dinosprint.vercel.app/",
    },
    {
        title: "EV Rental Website",
        description:
            "EV rental system managing 100+ bookings with QR vehicle access, wallet dashboard, and automated damage verification via Cloudinary. Won Breach FinTech Hackathon.",
        tags: ["React", "Tailwind", "MongoDB", "Node.js", "Cloudinary"],
        image: "/erental.png",
        githubUrl: "https://github.com/luvp21/EV-Rental",
        liveUrl: "https://deep-drillers-2-0.vercel.app/",
    },
    {
        title: "Interactive Portfolio",
        description:
            "A high-fidelity creative OS-style desktop canvas featuring draggable floating panels, live visitor counts, command pallette search, and real-time database-synced features.",
        tags: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
        image: "/portfolio.png",
        githubUrl: "https://github.com/luvp21/Portfolio",
        liveUrl: "https://luvvv.me",
    },
]

// ─────────────────────────────────────────────────────────────
//  EXPERIENCE & EDUCATION
// ─────────────────────────────────────────────────────────────
export type ExperienceIcon = "company" | "education" | "freelance" | "organization"

export interface ExperienceItem {
    id: number
    title: string
    company: string
    period: string
    description: string
    skills: string[]
    icon: ExperienceIcon
}

export const EXPERIENCE: ExperienceItem[] = [
    {
        id: 1,
        title: "AI Intern - CoE AI Innovation",
        company: "Befree Global",
        period: "May 2026 – Present",
        description:
            "Developing internal AI tools for employee workflows on the CoE AI Innovation team. Built a natural language RAG-based query chatbot and a production-grade document extraction/analysis engine using LLMs, vector search, and custom pipelines.",
        skills: ["LLMs", "Vector Search", "RAG Chatbots", "FastAPI", "Document Processing"],
        icon: "company",
    },
    {
        id: 2,
        title: "General Secretary",
        company: "Computer Society of India - Nirma University",
        period: "Aug 2025 – Present",
        description:
            "Running the chapter's operations and technical teams across all major events. Led web dev and logistics for HACKaMINeD 2026 (48-hour hybrid hackathon, 2,400+ participants, 600+ teams) and HackNUthon 6.0 (1,000+ participants). Managing a committee of 30+ members across web, design, content, and operations.",
        skills: ["Leadership", "Operations Management", "Event Logistics", "Team Collaboration"],
        icon: "organization",
    },
    {
        id: 3,
        title: "Core Committee Member (Full Stack Developer)",
        company: "Computer Society of India - Nirma University",
        period: "Feb 2025 – Aug 2025",
        description: "Built and maintain the chapter's event platform. Handled 1.1M+ HTTP requests across events with 98% uptime and 50k+ views. Developed an API-first backend to support multiple concurrent events.",
        skills: [
            "Node.js",
            "MongoDB",
            "Express",
            "JavaScript",
            "React",
            "PostgreSQL",
            "Web Development",
        ],
        icon: "organization",
    },
    {
        id: 4,
        title: "Executive Committee Member",
        company: "Computer Society of India - Nirma University",
        period: "Oct 2024 – Feb 2025",
        description: "First role in the chapter, contributing to event operations and web team during Cubix'25 planning.",
        skills: ["Event Operations", "Web Assistance", "Teamwork"],
        icon: "organization",
    },
    {
        id: 5,
        title: "B.Tech in Computer Science and Engineering",
        company: "Nirma University",
        period: "2023 – 2027",
        description:
            "Pursuing a Bachelor of Technology in Computer Science and Engineering at Nirma University. Grade: 8.35 CGPA.",
        skills: [
            "Data Structures and Algorithms",
            "OOP",
            "Operating Systems",
            "DBMS",
            "Full Stack Web Development",
        ],
        icon: "education",
    },
]

// ─────────────────────────────────────────────────────────────
//  ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────
export type AchievementIcon = "award" | "star" | "trophy" | "medal" | "sparkles"

export interface Achievement {
    id: string
    title: string
    description: string
    icon: AchievementIcon
    date?: string
    certificateUrl?: string
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: "1",
        title: "Runner Up | HACKaMINeD",
        description:
            "Won 2nd place at HACKaMINeD 2026 with Voice Copilot, an AI restaurant voice agent integrated with Petpooja POS.",
        icon: "trophy",
        date: "Mar 2026",
        certificateUrl: "https://drive.google.com/file/d/16KjLWRUyfhQB8bBUsG_hzaBjtzlvu8Vx/view?usp=sharing",
    },
    {
        id: "2",
        title: "Runner Up | Aetrix Hackathon",
        description:
            "Won 2nd place at Aetrix Hackathon with BHOOMI, a satellite environmental intelligence and forecasting platform.",
        icon: "trophy",
        date: "Mar 2026",
        certificateUrl: "https://drive.google.com/file/d/17doEogzjQKPRNtsiDGeXQzRuaxQ0aSf7/view?usp=sharing",
    },
    {
        id: "3",
        title: "Finalist | GUVI–HCL National Hackathon",
        description:
            "National finalist with Agentic Honeypot, an LLM-powered anti-fraud trap extracting UPI and bank scam coordinates.",
        icon: "award",
        date: "Feb 2026",
        certificateUrl: "https://drive.google.com/file/d/17QbM4pfA4tdXBkoY6NI2qoowB-xbkJbH/view?usp=sharing",
    },
    {
        id: "4",
        title: "Winner | Breach Hackathon",
        description:
            "1st place at PDEU's Breach FinTech Hackathon with EV Rental Platform featuring QR-based access and Cloudinary.",
        icon: "medal",
        date: "Mar 2025",
        certificateUrl: "https://drive.google.com/file/d/1vqtIVD1FBXioAMBudf_4Anx2mCZUZYb3/view?usp=sharing",
    },
    {
        id: "5",
        title: "Competitive Programming",
        description:
            "Solved 300+ problems on Codeforces (Pupil, peak rating 1216) and CodeChef (peak rating 1430).",
        icon: "sparkles",
    },
]

// ─────────────────────────────────────────────────────────────
//  TECH STACK
// ─────────────────────────────────────────────────────────────
export const TECH_STACK = [
    { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    { name: "React", icon: SiReact, color: "#61DAFB" },
    { name: "Next.js", icon: SiNextdotjs, color: "currentColor" },
    { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38BDF8" },
    { name: "Git", icon: SiGit, color: "#F05032" },
    { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
    { name: "HTML5", icon: SiHtml5, color: "#E34F26" },
    { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
]
