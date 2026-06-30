import SectionHeading from "./ui/SectionHeading";
import { usePublications, type PublicationItem } from "@/hooks/usePublications";
import { useSiteSettings } from "../context/SettingsContext";

function PublicationRow({ pub }: { pub: PublicationItem }) {
  return (
    <article className="reveal-up grid gap-4 py-7 sm:grid-cols-[5rem_1fr]">
      <div className="flex items-start gap-3 sm:flex-col sm:gap-1">
        <span className="font-serif text-2xl font-semibold text-ink">{pub.year}</span>
      </div>

      <div>
        <h3 className="title-1 leading-snug">{pub.title}</h3>
        <p className="prose-muted mt-2 text-sm">
          <span className="text-ink">{pub.authors}</span>
        </p>
        <p className="mt-1 text-sm italic text-muted">{pub.venue}</p>

        {pub.url && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              <span className="material-symbols-rounded text-[16px]">link</span>
              View Paper
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Publications({ index }: { index: string }) {
  const { data: publications } = usePublications();
  const { settings } = useSiteSettings();

  const sorted = [...publications].sort((a, b) => b.year - a.year);

  return (
    <section id="publications" className="section">
      <div className="container">
        <SectionHeading
          index={index}
          eyebrow={settings?.siteContent?.publicationsTitle || "Publications"}
          title={settings?.siteContent?.publicationsHeading || "Selected publications."}
          description={settings?.siteContent?.publicationsDescription || "A selection of peer-reviewed and preprint work. See my Google Scholar for the full list."}
        />

        <div className="mt-10 divide-y divide-line border-t border-line">
          {sorted.map((pub) => (
            <PublicationRow key={pub.id} pub={pub} />
          ))}
        </div>
      </div>
    </section>
  );
}
