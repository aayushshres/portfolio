// Site-wide profile content. Edit here to update the public site.
// (Placeholder copy — swap in real bio, links, and CV as needed.)

export const profile = {
  name: "Aayush Shrestha",
  role: "Software Developer · ML Researcher",
  affiliation: "Nepal Technology Innovation Center",
  location: "Dhulikhel, Kavre, Nepal",
  email: "aayushshrestha.work@gmail.com",
  cvUrl: "/assets/resume.pdf",
  avatar: "/images/linkedindp.png",

  // Hero
  headline: "I build software and research machine learning.",
  tagline:
    "I’m a software developer who designs and ships web and mobile applications end to end. I’m also a machine learning researcher, currently based at Nepal Technology Innovation Center.",

  // About
  bio: [
    "I’m a software developer with a computer science background. I build web and mobile applications from first prototype to production, and I care about writing clean, maintainable code that turns into products people actually use.",
    "I’m also a machine learning researcher, exploring how learning systems can solve real-world problems. I’ll be sharing more about that work here soon.",
  ],

  interests: [
    "Web Development",
    "Mobile Apps",
    "Full-Stack Engineering",
    "Machine Learning",
    "Computer Vision",
    "Deep Learning",
  ],
};

import type { SectionKey } from "@/context/SiteSettingsContext";

export interface NavItem {
  label: string;
  href: string;
  /** If set, this item only shows when the matching section is enabled. */
  flag?: SectionKey;
}

export const navItems: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research", flag: "research" },
  { label: "Projects", href: "#projects", flag: "projects" },
  { label: "Publications", href: "#publications", flag: "publications" },
  { label: "Contact", href: "#contact" },
];

export type SocialId = "github" | "linkedin" | "scholar" | "email";

export interface Social {
  id: SocialId;
  label: string;
  href: string;
}

export const socials: Social[] = [
  { id: "scholar", label: "Google Scholar", href: "https://scholar.google.com/" },
  { id: "github", label: "GitHub", href: "https://github.com/aayushshres" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/aayushshres/" },
  { id: "email", label: "Email", href: "mailto:aayushshrestha.work@gmail.com" },
];
