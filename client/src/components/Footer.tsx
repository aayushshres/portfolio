import { useProfile } from "@/hooks/useProfile";
import { navItems } from "./Header";
import { useFooterAdminUnlock } from "@/hooks/useFooterAdminUnlock";
import { useSettings } from "@/hooks/useSettings";

const year = new Date().getFullYear();

export default function Footer() {
  const { data: profile } = useProfile();
  const handleSecretClick = useFooterAdminUnlock();
  const { settings } = useSettings();

  const visibleNavItems = navItems.filter(
    (item) => !item.flag || settings.sections[item.flag]
  );

  return (
    <footer className="border-t border-line py-10">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <button
          onClick={handleSecretClick}
          className="font-serif text-sm font-semibold select-none cursor-default"
          aria-hidden="true"
          tabIndex={-1}
        >
          {profile?.name ?? "..."}
        </button>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {visibleNavItems.map(({ label, href }) => (
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
