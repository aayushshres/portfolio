import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/profile", label: "Profile", end: false },
  { to: "/admin/socials", label: "Socials", end: false },
  { to: "/admin/projects", label: "Projects", end: false },
  { to: "/admin/research", label: "Research", end: false },
  { to: "/admin/publications", label: "Publications", end: false },
  { to: "/admin/cv", label: "CV", end: false },
  { to: "/admin/messages", label: "Messages", end: false },
  { to: "/admin/settings", label: "Settings", end: false },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-dvh grid grid-cols-[16rem_1fr] bg-zinc-950 text-zinc-100">
      <aside className="border-r border-zinc-800 p-5 flex flex-col gap-6">
        <div className="text-lg font-semibold tracking-tight">Admin</div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 text-left"
        >
          Log out
        </button>
      </aside>
      <main className="p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
