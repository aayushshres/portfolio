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
    // 1. Function to attach scroll animation to an element
    const animateElement = (element: HTMLElement) => {
      if (element.dataset.revealed) return;
      element.dataset.revealed = "true";
      gsap.to(element, {
        scrollTrigger: { trigger: element, start: "top 92%" },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    // 2. Animate all elements currently in DOM
    gsap.utils.toArray<HTMLElement>(".reveal-up").forEach(animateElement);

    // 3. Watch for new .reveal-up elements added dynamically (e.g., from API data)
    const observer = new MutationObserver((mutations) => {
      let hasNewElements = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const el = node as HTMLElement;
            if (el.classList.contains("reveal-up")) {
              animateElement(el);
              hasNewElements = true;
            }
            const children = el.querySelectorAll(".reveal-up");
            if (children.length > 0) {
              children.forEach((child) => animateElement(child as HTMLElement));
              hasNewElements = true;
            }
          }
        });
      });
      // Refresh triggers if new elements were added
      if (hasNewElements) {
        ScrollTrigger.refresh();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 4. Refresh ScrollTrigger when the page height changes (images load, sections expand)
    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.querySelectorAll<HTMLElement>(".reveal-up").forEach(el => {
        delete el.dataset.revealed;
      });
    };
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
