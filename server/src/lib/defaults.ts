/**
 * Default data — seeded from the original static client data files.
 * Returned when R2 keys don't exist yet (first boot).
 */

export interface Profile {
  name: string;
  role: string;
  affiliation: string;
  location: string;
  email: string;
  headline: string;
  tagline: string;
  bio: string[];
  interests: string[];
  avatar: string;
}

export interface ContactInfo {
  contactHeading: string;
  contactDescription: string;
}

export interface Settings {
  sections: {
    research: boolean;
    projects: boolean;
    publications: boolean;
  };
  cv: {
    visible: boolean;
  };
}

export interface SocialItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  imgSrc: string;
  tags: string[];
  projectLink: string;
  repoLink?: string;
  order: number;
  published: boolean;
}

export interface ResearchItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  published: boolean;
}

export interface PublicationItem {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  url?: string;
  abstract?: string;
  published: boolean;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// ── Defaults ──────────────────────────────────────────────────────────

export const DEFAULT_PROFILE: Profile = {
  name: "Aayush Shrestha",
  role: "Software Developer · ML Researcher",
  affiliation: "Nepal Technology Innovation Center",
  location: "Dhulikhel, Kavre, Nepal",
  email: "aayushshrestha.work@gmail.com",
  headline: "I build software and research machine learning.",
  tagline:
    "I'm a software developer who designs and ships web and mobile applications end to end. I'm also a machine learning researcher, currently based at Nepal Technology Innovation Center.",
  bio: [
    "I'm a software developer with a computer science background. I build web and mobile applications from first prototype to production, and I care about writing clean, maintainable code that turns into products people actually use.",
    "I'm also a machine learning researcher, exploring how learning systems can solve real-world problems. I'll be sharing more about that work here soon.",
  ],
  interests: [
    "Web Development",
    "Mobile Apps",
    "Full-Stack Engineering",
    "Machine Learning",
    "Computer Vision",
    "Deep Learning",
  ],
  avatar: "/images/linkedindp.png",
};

export const DEFAULT_CONTACT: ContactInfo = {
  contactHeading: "Let’s collaborate.",
  contactDescription:
    "Open to research collaborations, PhD/industry opportunities, and conversations about ML for agriculture.",
};

export const DEFAULT_SETTINGS: Settings = {
  sections: {
    research: true,
    projects: true,
    publications: false,
  },
  cv: {
    visible: false,
  },
};

export const DEFAULT_SOCIALS: SocialItem[] = [
  { id: "scholar", label: "Google Scholar", href: "https://scholar.google.com/", visible: true },
  { id: "github", label: "GitHub", href: "https://github.com/aayushshres", visible: true },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/aayushshres/", visible: true },
  { id: "email", label: "Email", href: "mailto:aayushshrestha.work@gmail.com", visible: true },
];

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "groovy",
    title: "Groovy",
    description: "A cross-platform music app with playlists and playback, built in Flutter.",
    imgSrc: "/images/groovythumbnail.png",
    tags: ["Mobile App", "Flutter"],
    projectLink: "https://github.com/aayushshres/Groovy.git",
    order: 0,
    published: true,
  },
  {
    id: "hoodster",
    title: "Hoodster",
    description: "A community-focused social web app built on the MERN stack.",
    imgSrc: "/images/hoodsterthumbnail.png",
    tags: ["Web App", "MERN"],
    projectLink: "https://github.com/aayushshres/Hoodster.git",
    order: 1,
    published: true,
  },
  {
    id: "gs-image-generator",
    title: "GS Image Generator",
    description: "A full-stack image generation tool with a React front end and Node API.",
    imgSrc: "/images/gsimagegeneratorthumbnail.png",
    tags: ["Web App", "MERN"],
    projectLink: "https://github.com/aayushshres/GS-Image-Generator.git",
    order: 2,
    published: true,
  },
  {
    id: "hisabkitab",
    title: "Hisabkitab",
    description: "A personal finance and expense-tracking mobile app built with Flutter.",
    imgSrc: "/images/hisabkitabthumbnail.png",
    tags: ["Mobile App", "Flutter"],
    projectLink: "https://github.com/aayushshres/Hisabkitab.git",
    order: 3,
    published: true,
  },
  {
    id: "dash-blog",
    title: "Dash Blog",
    description: "A mobile blogging app with authoring and feeds, built in Flutter.",
    imgSrc: "/images/dashblogthumbnail.png",
    tags: ["Mobile App", "Flutter"],
    projectLink: "https://github.com/aayushshres/Dash-Blog.git",
    order: 4,
    published: true,
  },
  {
    id: "pixel-adventure",
    title: "Pixel Adventure",
    description: "A 2D platformer game prototype built with Flutter and the Flame engine.",
    imgSrc: "/images/pixeladventurethumbnail.png",
    tags: ["Mobile Game", "Flutter"],
    projectLink: "https://github.com/aayushshres/pixel-adventure.git",
    order: 5,
    published: true,
  },
  {
    id: "noob-vim",
    title: "Noob Vim",
    description: "A from-scratch Neovim configuration written in Lua for a fast editing setup.",
    imgSrc: "/images/noobvimthumbnail.png",
    tags: ["CLI", "Lua"],
    projectLink: "https://github.com/aayushshres/Noobvim.git",
    order: 6,
    published: true,
  },
];

export const DEFAULT_RESEARCH: ResearchItem[] = [
  {
    id: "crop-disease",
    title: "Crop Disease & Stress Detection",
    description:
      "Computer-vision models that flag plant disease and abiotic stress early from leaf, canopy, and drone imagery — designed to stay reliable across cultivars, lighting, and field conditions.",
    icon: "eco",
    published: true,
  },
  {
    id: "yield-forecasting",
    title: "Yield Forecasting",
    description:
      "Multimodal time-series models that fuse weather, soil, and satellite signals to forecast yields earlier in the season, with calibrated uncertainty for real decision-making.",
    icon: "trending_up",
    published: true,
  },
  {
    id: "remote-sensing",
    title: "Remote Sensing for Field Monitoring",
    description:
      "Turning satellite and UAV imagery into field-scale insight — segmentation, change detection, and crop-type mapping that scale from a single plot to whole regions.",
    icon: "satellite_alt",
    published: true,
  },
  {
    id: "efficient-ml",
    title: "Efficient & Edge ML",
    description:
      "Compressing and adapting models so they run on phones, drones, and low-cost field hardware — distillation, quantization, and data-efficient training for low-resource settings.",
    icon: "memory",
    published: true,
  },
];

export const DEFAULT_PUBLICATIONS: PublicationItem[] = [
  {
    id: "pub-1",
    title: "Robust Cross-Region Crop Disease Detection with Self-Supervised Pretraining",
    authors: "A. Shrestha, J. Doe, M. Smith",
    venue: "Computers and Electronics in Agriculture",
    year: 2025,
    url: "#",
    published: true,
  },
  {
    id: "pub-2",
    title: "Calibrated Multimodal Yield Forecasting from Satellite and Weather Time Series",
    authors: "A. Shrestha, R. Kumar, L. Chen",
    venue: "NeurIPS Workshop on Tackling Climate Change with ML",
    year: 2024,
    url: "#",
    published: true,
  },
  {
    id: "pub-3",
    title: "Lightweight Segmentation of UAV Imagery for In-Field Crop Monitoring",
    authors: "A. Shrestha, P. Patel",
    venue: "IEEE/CVF CVPR Workshop on Agriculture-Vision",
    year: 2024,
    url: "#",
    published: true,
  },
  {
    id: "pub-4",
    title: "Data-Efficient Crop-Type Mapping under Label Scarcity: A Benchmark",
    authors: "A. Shrestha, S. Gurung, T. Williams",
    venue: "arXiv preprint",
    year: 2023,
    url: "#",
    published: true,
  },
];
