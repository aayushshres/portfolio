import { useState, useEffect } from "react";
import { useSocials, type Social } from "@/hooks/useSocials";
import { api } from "@/lib/api";
import Toggle from "../components/Toggle";

const FIXED_PLATFORMS = [
  { id: "scholar", label: "Google Scholar" },
  { id: "github", label: "GitHub" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "email", label: "Email" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "twitter", label: "Twitter(X)" },
  { id: "tiktok", label: "TikTok" },
];

export default function SocialsAdmin() {
  const { data, loading, refetch } = useSocials(true);
  const [items, setItems] = useState<Social[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      const dataMap = new Map(data.map((d) => [d.id, d]));
      const dataOrdered = data.filter((d) => FIXED_PLATFORMS.some((p) => p.id === d.id));
      const dataSet = new Set(dataOrdered.map((d) => d.id));
      
      const missing = FIXED_PLATFORMS.filter((p) => !dataSet.has(p.id)).map((p) => ({
        id: p.id,
        label: p.label,
        href: "",
        visible: false,
      }));
      
      setItems([...dataOrdered, ...missing]);
    }
  }, [data]);

  const update = (id: string, patch: Partial<Social>) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const moveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setItems((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const toSave = items.map((item) => ({
      ...item,
    }));
    try {
      await api.put("/socials", toSave);
      await refetch();
      setSuccess(true);
      setEditingId(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Socials</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your social links. Toggle visibility per item.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white
                       hover:bg-brand-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-900 bg-red-900/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-green-900 bg-green-900/30 p-3 text-sm text-green-300">
          Saved successfully!
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <div className="rounded-xl border border-zinc-800 p-8 text-center text-sm text-zinc-500">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 p-8 text-center text-sm text-zinc-500">
            No social links available.
          </div>
        ) : (
          items.map((item, index) => {
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isEditing ? "border-brand-700/50 bg-zinc-900" : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="rounded p-0.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-20"
                      aria-label="Move up"
                    >
                      <span className="material-symbols-rounded text-[16px]">arrow_upward</span>
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === items.length - 1}
                      className="rounded p-0.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-20"
                      aria-label="Move down"
                    >
                      <span className="material-symbols-rounded text-[16px]">arrow_downward</span>
                    </button>
                  </div>

                  <span className="material-symbols-rounded text-zinc-500 text-[18px]">link</span>

                  <p className="flex-1 text-sm font-medium text-zinc-200 truncate">
                    {item.label || <span className="italic text-zinc-500">Untitled</span>}
                  </p>

                  <Toggle
                    checked={item.visible}
                    onChange={() => update(item.id, { visible: !item.visible })}
                    label={`Toggle ${item.label} visibility`}
                  />

                  <button
                    onClick={() => setEditingId(isEditing ? null : item.id)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs
                               font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    {isEditing ? "Done" : "Edit"}
                  </button>
                </div>

                {isEditing && (
                  <div className="mt-4 grid gap-4 border-t border-zinc-800 pt-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Label</label>
                      <input
                        value={item.label}
                        onChange={(e) => update(item.id, { label: e.target.value })}
                        placeholder="e.g. GitHub"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">URL</label>
                      <input
                        type="url"
                        value={item.href}
                        onChange={(e) => update(item.id, { href: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
