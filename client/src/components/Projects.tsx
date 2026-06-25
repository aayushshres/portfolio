import SectionHeading from "./ui/SectionHeading";
import { useProjects } from "@/hooks/useProjects";

export default function Projects({ index }: { index: string }) {
  const { data: projects } = useProjects();

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeading
          index={index}
          eyebrow="Projects"
          title="Things I’ve built."
          description="A selection of web and mobile projects from my software engineering work — the foundation I’m building my research on."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={project.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover reveal-up group flex flex-col overflow-hidden"
            >
              <div className="aspect-[16/10] overflow-hidden border-b border-line bg-paper">
                <img
                  src={project.imgSrc}
                  alt={`${project.title} thumbnail`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="title-1">{project.title}</h3>
                  <span className="material-symbols-rounded text-[18px] text-muted transition-colors group-hover:text-brand-700">
                    arrow_outward
                  </span>
                </div>
                <p className="prose-muted mt-2 text-sm">{project.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li key={tag} className="chip">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
