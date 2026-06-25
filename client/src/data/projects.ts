// Software projects (from the previous portfolio). Descriptions are short
// placeholders — tweak to taste. Thumbnails live in /public/images/.

export interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
}

export const projects: Project[] = [
  {
    title: "Groovy",
    description: "A cross-platform music app with playlists and playback, built in Flutter.",
    image: "/images/groovythumbnail.png",
    tags: ["Mobile App", "Flutter"],
    link: "https://github.com/aayushshres/Groovy.git",
  },
  {
    title: "Hoodster",
    description: "A community-focused social web app built on the MERN stack.",
    image: "/images/hoodsterthumbnail.png",
    tags: ["Web App", "MERN"],
    link: "https://github.com/aayushshres/Hoodster.git",
  },
  {
    title: "GS Image Generator",
    description: "A full-stack image generation tool with a React front end and Node API.",
    image: "/images/gsimagegeneratorthumbnail.png",
    tags: ["Web App", "MERN"],
    link: "https://github.com/aayushshres/GS-Image-Generator.git",
  },
  {
    title: "Hisabkitab",
    description: "A personal finance and expense-tracking mobile app built with Flutter.",
    image: "/images/hisabkitabthumbnail.png",
    tags: ["Mobile App", "Flutter"],
    link: "https://github.com/aayushshres/Hisabkitab.git",
  },
  {
    title: "Dash Blog",
    description: "A mobile blogging app with authoring and feeds, built in Flutter.",
    image: "/images/dashblogthumbnail.png",
    tags: ["Mobile App", "Flutter"],
    link: "https://github.com/aayushshres/Dash-Blog.git",
  },
  {
    title: "Pixel Adventure",
    description: "A 2D platformer game prototype built with Flutter and the Flame engine.",
    image: "/images/pixeladventurethumbnail.png",
    tags: ["Mobile Game", "Flutter"],
    link: "https://github.com/aayushshres/pixel-adventure.git",
  },
  {
    title: "Noob Vim",
    description: "A from-scratch Neovim configuration written in Lua for a fast editing setup.",
    image: "/images/noobvimthumbnail.png",
    tags: ["CLI", "Lua"],
    link: "https://github.com/aayushshres/Noobvim.git",
  },
];
