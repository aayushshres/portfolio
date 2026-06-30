import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// GSAP setup
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { router } from "./routes/router";

// Styles
import "./index.css";
import "lenis/dist/lenis.css";

// Register GSAP plugins once for the whole app.
gsap.registerPlugin(useGSAP, ScrollTrigger);

// Inject JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Aayush Shrestha",
  "jobTitle": "Software Developer & Machine Learning Researcher",
  "url": "https://aayushshrestha.dev/",
  "sameAs": [
    "https://github.com/aayushres",
    "https://linkedin.com/in/aayushshrestha" 
  ],
  "knowsAbout": [
    "Software Development",
    "Machine Learning",
    "Full-Stack Web Development",
    "Mobile Applications",
    "React",
    "TypeScript",
    "Python"
  ]
};

const script = document.createElement("script");
script.type = "application/ld+json";
script.textContent = JSON.stringify(jsonLd);
document.head.appendChild(script);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
