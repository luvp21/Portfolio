import {
    SiNextdotjs,
    SiTypescript,
    SiReact,
    SiPrisma,
    SiTailwindcss,
    SiMongodb,
    SiMdx,
    SiPostgresql,
    SiSocketdotio,
    SiNodedotjs,
    SiVercel,
    SiMysql,
} from "react-icons/si"

export const techIcons: Record<string, JSX.Element> = {
    // Core
    "Next.js": <SiNextdotjs className="w-[22px] h-[22px] text-black dark:text-white" />,
    React: <SiReact className="w-[22px] h-[22px] text-[#61DAFB]" />,
    TypeScript: <SiTypescript className="w-[22px] h-[22px] text-[#3178C6]" />,
    Tailwind: <SiTailwindcss className="w-[22px] h-[22px] text-[#38BDF8]" />,
    Vercel: <SiVercel className="w-[22px] h-[22px] text-black dark:text-white" />,

    // Databases
    MongoDB: <SiMongodb className="w-[22px] h-[22px] text-[#4DB33D]" />,
    PostgreSQL: <SiPostgresql className="w-[22px] h-[22px] text-[#336791]" />,
    SQL: <SiMysql className="w-[22px] h-[22px] text-[#005C84]" />, // using MySQL icon for SQL

    // Backend / BE tools
    "Node.js": <SiNodedotjs className="w-[22px] h-[22px] text-[#539E43]" />,
    "Socket.io": <SiSocketdotio className="w-[22px] h-[22px] text-black dark:text-white" />,

    // Extras
    Prisma: <SiPrisma className="w-[22px] h-[22px] text-black dark:text-white" />,
    MDX: <SiMdx className="w-[22px] h-[22px] text-black dark:text-white" />,
}
