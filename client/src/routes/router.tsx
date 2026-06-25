import { createBrowserRouter } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { RequireAdmin } from "./RequireAdmin";
import AdminLayout from "@/admin/AdminLayout";
import Dashboard from "@/admin/pages/Dashboard";
import Settings from "@/admin/pages/Settings";
import Login from "@/admin/pages/Login";
import ProfileAdmin from "@/admin/pages/Profile";
import SocialsAdmin from "@/admin/pages/Socials";
import ProjectsAdmin from "@/admin/pages/Projects";
import ResearchAdmin from "@/admin/pages/Research";
import PublicationsAdmin from "@/admin/pages/Publications";
import CVAdmin from "@/admin/pages/CV";
import MessagesAdmin from "@/admin/pages/Messages";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "admin/login", element: <Login /> },
      {
        path: "admin",
        element: (
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "settings", element: <Settings /> },
          { path: "profile", element: <ProfileAdmin /> },
          { path: "socials", element: <SocialsAdmin /> },
          { path: "projects", element: <ProjectsAdmin /> },
          { path: "research", element: <ResearchAdmin /> },
          { path: "publications", element: <PublicationsAdmin /> },
          { path: "cv", element: <CVAdmin /> },
          { path: "messages", element: <MessagesAdmin /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
