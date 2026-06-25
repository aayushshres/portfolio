import SectionHeading from "./ui/SectionHeading";
import { useResearch } from "@/hooks/useResearch";

export default function Research({ index }: { index: string }) {
  const { data: researchAreas, loading } = useResearch();

  if (loading) return null;

  return (
    <section id="research" className="section bg-surface/60 border-y border-line">
      <div className="container">
        <SectionHeading
          index={index}
          eyebrow="Research"
          title="What I work on."
          description="Threads of work that share one goal: machine learning that stays reliable once it leaves the lab and reaches the field."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {researchAreas.map((area) => (
            <article key={area.id} className="card card-hover reveal-up p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <span className="material-symbols-rounded text-[24px]">{area.icon}</span>
              </span>
              <h3 className="title-1 mt-5">{area.title}</h3>
              <p className="prose-muted mt-3 text-sm">{area.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
