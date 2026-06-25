import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useProfile } from "@/hooks/useProfile";
import { useCvUrl } from "@/hooks/useCvUrl";
import PdfViewerModal from "@/components/PdfViewerModal";
import { usePdfViewer } from "@/hooks/usePdfViewer";

export type SectionKey = "research" | "projects" | "publications";

export interface NavItem {
  label: string;
  href: string;
  flag?: SectionKey;
}

export const navItems: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research", flag: "research" },
  { label: "Projects", href: "#projects", flag: "projects" },
  { label: "Publications", href: "#publications", flag: "publications" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettings();
  const { data: profile } = useProfile();
  const { url: cvUrl } = useCvUrl();
  const { isOpen: cvOpen, openViewer: openCv, closeViewer: closeCv } = usePdfViewer();

  const items = navItems.filter((item) => !item.flag || settings.sections[item.flag]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogo = () => {
    // Secret: 5 quick clicks unlocks the admin area. (Actually typing "sudo" now but keeping old handler behavior for click to top)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-paper/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      {/* Hidden input to allow typing 'sudo' without issues if needed, though useSecretUnlock works anywhere */}
      <div className="container flex h-16 items-center justify-between lg:h-20">
        <button
          onClick={handleLogo}
          className="group font-serif text-lg font-semibold tracking-tight hover:text-brand-700 transition-colors"
        >
          {profile?.name ?? "..."}
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {items.map(({ label, href }) => (
            <a key={href} href={href} className="nav-link">
              {label}
            </a>
          ))}
          {cvUrl && settings.cv.visible && (
            <button onClick={openCv} className="btn btn-outline">
              <span className="material-symbols-rounded text-[18px]">description</span>
              CV
            </button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink md:hidden"
          onClick={() => setOpen((p) => !p)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="material-symbols-rounded">{open ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-line bg-paper md:hidden">
          <div className="container flex flex-col py-4">
            {items.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-muted hover:text-ink"
              >
                {label}
              </a>
            ))}
            {cvUrl && settings.cv.visible && (
              <button onClick={openCv} className="btn btn-outline mt-3 self-start">
                <span className="material-symbols-rounded text-[18px]">description</span>
                CV
              </button>
            )}
          </div>
        </nav>
      )}
      {cvOpen && cvUrl && <PdfViewerModal url={cvUrl} onClose={closeCv} />}
    </header>
  );
}
