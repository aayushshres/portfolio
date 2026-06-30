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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
