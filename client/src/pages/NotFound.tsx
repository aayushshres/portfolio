import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center text-center px-4">
      <div>
        <p className="text-7xl font-semibold">404</p>
        <p className="mt-4 text-zinc-400">This page doesn’t exist.</p>
        <Link
          to="/"
          className="inline-block mt-8 px-5 py-2.5 rounded-xl bg-zinc-50 text-zinc-900 font-medium"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
