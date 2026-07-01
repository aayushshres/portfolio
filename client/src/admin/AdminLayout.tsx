import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/profile", label: "Profile", end: false },
  { to: "/admin/about", label: "About", end: false },
  { to: "/admin/socials", label: "Socials", end: false },
  { to: "/admin/projects", label: "Projects", end: false },
  { to: "/admin/research", label: "Research", end: false },
  { to: "/admin/publications", label: "Publications", end: false },
  { to: "/admin/cv", label: "CV", end: false },
  { to: "/admin/messages", label: "Messages", end: false },
  { to: "/admin/contact", label: "Contact", end: false },
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
    <div className="h-dvh overflow-hidden flex flex-col md:grid md:grid-cols-[16rem_1fr] bg-zinc-950 text-zinc-100">
      <aside className="border-b md:border-b-0 md:border-r border-zinc-800 p-4 md:p-5 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between md:block">
          <div className="text-lg font-semibold tracking-tight">Admin</div>
          <button
            onClick={handleLogout}
            className="md:hidden px-3 py-1.5 rounded-lg text-xs bg-zinc-900 text-zinc-300 hover:text-zinc-100"
          >
            Log out
          </button>
        </div>
        <nav className="flex overflow-x-auto md:overflow-y-auto md:flex-col gap-2 pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 rounded-lg text-sm transition-colors ${
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
          className="hidden md:block mt-auto px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 text-left"
        >
          Log out
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
