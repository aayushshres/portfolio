import Socials from "./ui/Socials";
import { useProfile } from "@/hooks/useProfile";
import { useCvUrl } from "@/hooks/useCvUrl";

export default function Hero() {
  const { data: profile, loading: profileLoading } = useProfile();
  const { url: cvUrl, loading: cvLoading } = useCvUrl();

  if (profileLoading || !profile) return null;

  return (
    <section id="home" className="relative overflow-hidden pt-28 lg:pt-36">
      {/* soft background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl"
      />

      <div className="container relative grid items-center gap-12 pb-20 lg:grid-cols-[1.4fr_1fr] lg:gap-16 lg:pb-28">
        {/* Left: intro */}
        <div>
          <p className="eyebrow reveal-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            {profile.role}
          </p>

          <h1 className="display-1 mt-6 reveal-up">{profile.headline}</h1>

          <p className="lead mt-6 max-w-xl reveal-up">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3 reveal-up">
            <a href="#publications" className="btn btn-primary">
              View Publications
              <span className="material-symbols-rounded text-[18px]">arrow_downward</span>
            </a>
            {!cvLoading && cvUrl && (
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Download CV
                <span className="material-symbols-rounded text-[18px]">download</span>
              </a>
            )}
          </div>

          <div className="mt-8 reveal-up">
            <Socials />
          </div>
        </div>

        {/* Right: portrait + quick facts */}
        <div className="reveal-up">
          <div className="relative mx-auto max-w-sm">
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-3xl bg-brand-100"
            />
            <div className="card overflow-hidden rounded-3xl">
              <img
                src={profile.avatar}
                alt={`${profile.name} portrait`}
                width={420}
                height={420}
                className="aspect-square w-full object-cover"
              />
              <dl className="divide-y divide-line">
                <div className="flex items-center justify-between px-5 py-3 text-sm">
                  <dt className="text-muted">Role</dt>
                  <dd className="font-medium text-ink">{profile.role}</dd>
                </div>
                <div className="flex items-center justify-between px-5 py-3 text-sm">
                  <dt className="text-muted">Workplace</dt>
                  <dd className="font-medium text-ink">{profile.affiliation}</dd>
                </div>
                <div className="flex items-center justify-between px-5 py-3 text-sm">
                  <dt className="text-muted">Based in</dt>
                  <dd className="font-medium text-ink">{profile.location}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
