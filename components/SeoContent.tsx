// Screen-reader-only content mirroring the interactive panels' data so
// search engines and assistive tech can discover it without the panel
// ever being opened. Purely additive — invisible to sighted users via the
// same `sr-only` utility already used for icon-button labels elsewhere,
// and doesn't touch the interactive panel system at all.
import {
    PERSONAL,
    PROJECTS,
    EXPERIENCE,
    ACHIEVEMENTS,
    TECH_STACK,
    PROFILE_LINKS,
} from "@/lib/data"

export function SeoContent() {
    return (
        <div className="sr-only">
            <h2>About {PERSONAL.name}</h2>
            <p>{PERSONAL.bio}</p>

            <h2>Links</h2>
            <ul>
                {PROFILE_LINKS.map((link) => (
                    <li key={link.label}>
                        <a href={link.href}>{link.label}</a>
                    </li>
                ))}
            </ul>

            <h2>Projects</h2>
            {PROJECTS.map((project) => (
                <article key={project.title}>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <p>Technologies: {project.tags.join(", ")}</p>
                    <ul>
                        {project.githubUrl && (
                            <li>
                                <a href={project.githubUrl}>Source code on GitHub</a>
                            </li>
                        )}
                        {project.liveUrl && (
                            <li>
                                <a href={project.liveUrl}>Live demo</a>
                            </li>
                        )}
                    </ul>
                </article>
            ))}

            <h2>Experience & Education</h2>
            {EXPERIENCE.map((exp) => (
                <article key={exp.id}>
                    <h3>{exp.title} — {exp.company}</h3>
                    <p>{exp.period}</p>
                    <p>{exp.description}</p>
                    <p>Skills: {exp.skills.join(", ")}</p>
                </article>
            ))}

            <h2>Achievements</h2>
            {ACHIEVEMENTS.map((achievement) => (
                <article key={achievement.id}>
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    {achievement.date && <p>{achievement.date}</p>}
                </article>
            ))}

            <h2>Tech Stack</h2>
            <p>{TECH_STACK.map((tech) => tech.name).join(", ")}</p>
        </div>
    )
}
