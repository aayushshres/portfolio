import { useState, useEffect } from "react";
import { usePublications, type PublicationItem } from "@/hooks/usePublications";
import { api } from "@/lib/api";
import Toggle from "../components/Toggle";

function generateId(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

const EMPTY_ITEM: Omit<PublicationItem, "id"> = {
  title: "",
  authors: "",
  venue: "",
  year: new Date().getFullYear(),
  url: "",
  abstract: "",
  published: true,
};

export default function PublicationsAdmin() {
  const { data, loading, refetch } = usePublications(true);
  const [items, setItems] = useState<PublicationItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data) setItems([...data].sort((a, b) => b.year - a.year));
  }, [data]);

  const update = (id: string, patch: Partial<PublicationItem>) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const addNew = () => {
    const newItem: PublicationItem = { id: `new-${Date.now()}`, ...EMPTY_ITEM };
    setItems((prev) => [newItem, ...prev]);
    setEditingId(newItem.id);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const toSave = items.map((item) => ({
      ...item,
      id: item.id.startsWith("new-") ? generateId(item.title) || item.id : item.id,
    }));
    try {
      await api.put("/publications", toSave);
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
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Publications</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your publications. They are sorted by year descending.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addNew}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800
                       px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
          >
            <span className="material-symbols-rounded text-[16px]">add</span>
            Add Item
          </button>
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
            No publications yet. Click "Add Item" to create one.
          </div>
        ) : (
          items.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isEditing ? "border-brand-700/50 bg-zinc-900" : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                    {item.year}
                  </span>

                  <p className="flex-1 text-sm font-medium text-zinc-200 truncate">
                    {item.title || <span className="italic text-zinc-500">Untitled</span>}
                  </p>

                  <Toggle
                    checked={item.published}
                    onChange={() => update(item.id, { published: !item.published })}
                    label={`Toggle ${item.title} visibility`}
                  />

                  <button
                    onClick={() => setEditingId(isEditing ? null : item.id)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs
                               font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    {isEditing ? "Done" : "Edit"}
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="rounded-lg border border-zinc-700 p-1.5 text-zinc-500
                               hover:border-red-900 hover:text-red-400"
                    aria-label="Delete item"
                  >
                    <span className="material-symbols-rounded text-[16px]">delete</span>
                  </button>
                </div>

                {isEditing && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
                      <textarea
                        rows={2}
                        value={item.title}
                        onChange={(e) => update(item.id, { title: e.target.value })}
                        placeholder="Paper Title"
                        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Authors</label>
                      <input
                        value={item.authors}
                        onChange={(e) => update(item.id, { authors: e.target.value })}
                        placeholder="Shrestha, A., ..."
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Venue</label>
                      <input
                        value={item.venue}
                        onChange={(e) => update(item.id, { venue: e.target.value })}
                        placeholder="Journal or conference name"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Year</label>
                      <input
                        type="number"
                        min={1900}
                        max={2100}
                        value={item.year}
                        onChange={(e) => update(item.id, { year: parseInt(e.target.value) || new Date().getFullYear() })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">URL</label>
                      <input
                        type="url"
                        value={item.url || ""}
                        onChange={(e) => update(item.id, { url: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Abstract (Optional)</label>
                      <textarea
                        rows={4}
                        value={item.abstract || ""}
                        onChange={(e) => update(item.id, { abstract: e.target.value })}
                        placeholder="Brief summary..."
                        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
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
