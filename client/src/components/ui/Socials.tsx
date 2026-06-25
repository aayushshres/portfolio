import type { JSX } from "react";
import { useSocials } from "@/hooks/useSocials";

const icons: Record<string, JSX.Element> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 .5C5.73 .5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-2c-3.2.69-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.3 8.2h4.4V24H.3V8.2Zm7.5 0h4.21v2.16h.06c.59-1.06 2.02-2.18 4.16-2.18 4.45 0 5.27 2.93 5.27 6.74V24h-4.4v-7.3c0-1.74-.03-3.98-2.43-3.98-2.43 0-2.8 1.9-2.8 3.85V24h-4.4V8.2Z" />
    </svg>
  ),
  scholar: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm0-24L0 9.5l4.84 3.77A8 8 0 0 1 12 9a8 8 0 0 1 7.16 4.27L24 9.5 12 0Z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
};

export default function Socials({ className = "" }: { className?: string }) {
  const { data: socials, loading } = useSocials();

  if (loading) return null;

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {socials.map(({ id, label, href }) => (
        <li key={id}>
          <a
            href={href}
            target={id === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            {icons[id]}
          </a>
        </li>
      ))}
    </ul>
  );
}
