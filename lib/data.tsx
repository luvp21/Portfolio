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
    bio: "Computer Science student at Nirma University who enjoys turning ideas into working software and constantly learning new technologies.",
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
        icon: <img src="/icons/leetcode.svg" alt="LeetCode" className="w-5 h-5 object-contain" />,
    },
    {
        label: "Codeforces",
        href: "https://codeforces.com/profile/luvv",
        icon: <img src="/icons/cf.svg" alt="Codeforces" className="w-5 h-5 object-contain" />,
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
        title: "DinoSprint – Pixel Endless Runner",
        description:
            "Chrome Dino–style endless runner with leaderboard, unlockable skins, and session stats.",
        tags: ["Vite", "TypeScript", "React", "Tailwind", "Supabase", "Vercel"],
        image: "/Dino.png",
        githubUrl: "https://github.com/luvp21/Dino",
        liveUrl: "https://dinosprint.vercel.app/",
    },
    {
        title: "Interactive Portfolio",
        description:
            "A canvas-based portfolio with draggable panels and Command Terminal",
        tags: ["Next.js", "TypeScript", "Tailwind", "React", "Vercel"],
        image: "/portfolio.png",
        githubUrl: "https://github.com/luvp21/Portfolio",
        liveUrl: "https://luv-patel.vercel.app/",
    },
    {
        title: "EV Rental Website",
        description:
            "EV rental system with secure KYC, real-time tracking, and automated payments.",
        tags: ["React", "Tailwind", "MongoDB", "Node.js", "Vercel"],
        image: "/erental.png",
        githubUrl: "https://github.com/mihir1816/Deep-Drillers-2.0",
    },
    {
        title: "Excalidraw Clone",
        description:
            "A collaborative whiteboard tool for drawing, brainstorming, and visualizing ideas in a hand-drawn style.",
        tags: ["TypeScript", "Next.js", "Tailwind", "Prisma", "PostgreSQL", "Socket.io"],
        image: "/excalidraw.png",
        githubUrl: "https://github.com/luvp21/Draw-App",
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
        title: "General Secretary",
        company: "Computer Society of India - Nirma University",
        period: "Aug 2025 – Present",
        description:
            "Managing club operations, leading teams, and overseeing events and initiatives at CSI Nirma.",
        skills: ["Leadership", "Team Management", "Communication"],
        icon: "organization",
    },
    {
        id: 2,
        title: "Core Committee Member",
        company: "Computer Society of India - Nirma University",
        period: "Oct 2024 – Aug 2025",
        description: "Developed CSI Nirma's official website.",
        skills: [
            "Node.js",
            "MongoDB",
            "Express",
            "JavaScript",
            "React",
            "Web Development",
        ],
        icon: "organization",
    },
    {
        id: 3,
        title: "B.Tech in Computer Science and Engineering",
        company: "Nirma University",
        period: "2023 – 2027",
        description:
            "Pursuing a B.Tech in Computer Science and Engineering at Nirma University.",
        skills: [
            "Data Structures and Algorithms",
            "OOP",
            "Operating System",
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
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: "1",
        title: "Hackathon Winner",
        description:
            "1st place at Breach FinTech hackathon (at PDEU) with an AI-powered EV rental system.",
        icon: "trophy",
        date: "May 2025",
    },
    {
        id: "2",
        title: "LeetCode",
        description:
            "Solved 100+ problems on LeetCode, building strong DSA fundamentals.",
        icon: "award",
    },
    {
        id: "3",
        title: "Codeforces",
        description: "Reached Pupil rank and solved 250+ problems on Codeforces.",
        icon: "star",
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
