import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";

export default function Dashboard() {
  const { settings } = useSettings();
  const sections = Object.entries(settings.sections);
  const liveCount = sections.filter(([, on]) => on).length + (settings.cv.visible ? 1 : 0);
  const totalCount = sections.length + 1; // +1 for CV

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-zinc-400">
        Admin area is unlocked. Manage what visitors see on the public site.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400">Public sections live</p>
          <p className="mt-1 text-3xl font-semibold">
            {liveCount}
            <span className="text-lg text-zinc-500"> / {totalCount}</span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400">Manage visibility</p>
          <Link
            to="/admin/settings"
            className="mt-2 inline-flex items-center gap-1 font-medium text-brand-400 hover:text-brand-300"
          >
            Go to Settings →
          </Link>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
        {sections.map(([key, on]) => (
          <li key={key} className="flex items-center justify-between p-4 capitalize">
            <span>{key}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                on
                  ? "bg-brand-500/15 text-brand-400"
                  : "bg-zinc-700/40 text-zinc-400"
              }`}
            >
              {on ? "Visible" : "Hidden"}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between p-4 capitalize">
          <span>CV Section</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              settings.cv.visible
                ? "bg-brand-500/15 text-brand-400"
                : "bg-zinc-700/40 text-zinc-400"
            }`}
          >
            {settings.cv.visible ? "Visible" : "Hidden"}
          </span>
        </li>
      </ul>
    </div>
  );
}
