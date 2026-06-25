import { useProfile } from "@/hooks/useProfile";
import { navItems } from "./Header";

const year = new Date().getFullYear();

export default function Footer() {
  const { data: profile } = useProfile();

  return (
    <footer className="border-t border-line py-10">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 font-serif text-sm font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-600 text-xs font-bold text-white">
            AS
          </span>
          {profile?.name ?? "..."}
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {navItems.map(({ label, href }) => (
            <a key={href} href={href} className="text-sm text-muted hover:text-ink">
              {label}
            </a>
          ))}
        </nav>

        <p className="text-sm text-muted">
          © {year} {profile?.name ?? "..."}
        </p>
      </div>
    </footer>
  );
}
