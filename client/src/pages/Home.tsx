import { ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Research from "@/components/Research";
import Projects from "@/components/Projects";
import Publications from "@/components/Publications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useSettings } from "@/hooks/useSettings";

type SectionKey = "research" | "projects" | "publications";
type NumberedSection = React.ComponentType<{ index: string }>;

// Ordered content sections. `flag` ones only render when enabled in settings.
const SECTIONS: { Component: NumberedSection; flag?: SectionKey }[] = [
  { Component: About },
  { Component: Research, flag: "research" },
  { Component: Projects, flag: "projects" },
  { Component: Publications, flag: "publications" },
  { Component: Contact },
];

/**
 * Public portfolio landing page. Holds the Lenis smooth-scroll wrapper and the
 * global GSAP scroll-reveal animation (`.reveal-up` elements). Section numbering
 * is computed from whichever sections are enabled in site settings.
 */
export default function Home() {
  const { settings } = useSettings();

  const visible = SECTIONS.filter(
    (s) => !s.flag || settings.sections[s.flag as keyof typeof settings.sections]
  );

  useGSAP(() => {
    const elements = gsap.utils.toArray<HTMLElement>(".reveal-up");
    elements.forEach((element) => {
      gsap.to(element, {
        scrollTrigger: { trigger: element, start: "top 92%" },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });
    });
  }, [visible.length]);

  return (
    <ReactLenis root>
      <Header />
      <main>
        <Hero />
        {visible.map(({ Component }, i) => (
          <Component key={i} index={String(i + 1).padStart(2, "0")} />
        ))}
      </main>
      <Footer />
    </ReactLenis>
  );
}
