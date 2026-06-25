import Socials from "./ui/Socials";
import { useProfile } from "@/hooks/useProfile";
import { useCvUrl } from "@/hooks/useCvUrl";
import { useSettings } from "@/hooks/useSettings";
import { useLenis } from "lenis/react";

export default function Hero() {
  const { data: profile } = useProfile();
  const { url: cvUrl, loading: cvLoading } = useCvUrl();
  const { settings } = useSettings();
  const lenis = useLenis();

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
          <p className="eyebrow">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            {profile.role}
          </p>

          <h1 className="display-1 mt-6">{profile.headline}</h1>

          <p className="lead mt-6 max-w-xl">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {settings.sections.publications ? (
              <a href="#publications" onClick={(e) => { e.preventDefault(); lenis?.scrollTo("#publications"); }} className="btn btn-primary">
                View Publications
                <span className="material-symbols-rounded text-[18px]">arrow_downward</span>
              </a>
            ) : settings.sections.projects ? (
              <a href="#projects" onClick={(e) => { e.preventDefault(); lenis?.scrollTo("#projects"); }} className="btn btn-primary">
                View Projects
                <span className="material-symbols-rounded text-[18px]">arrow_downward</span>
              </a>
            ) : null}
            {!cvLoading && cvUrl && settings.cv.visible && (
              <a href={cvUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                View CV
                <span className="material-symbols-rounded text-[18px]">description</span>
              </a>
            )}
          </div>

          <div className="mt-8">
            <Socials />
          </div>
        </div>

        {/* Right: portrait + quick facts */}
        <div>
          <div className="relative mx-auto max-w-sm">
            {/* Mobile background: Centered gradient blur */}
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -z-10 h-[105%] w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] bg-gradient-to-tr from-brand-200 to-brand-50 blur-xl opacity-70 md:hidden"
            />
            {/* Desktop background: Offset solid box */}
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 -z-10 hidden h-full w-full rounded-3xl bg-brand-100 md:block"
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
                  <dt className="text-muted">Affiliated</dt>
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
