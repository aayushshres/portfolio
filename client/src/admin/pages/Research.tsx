import { useState, useEffect } from "react";
import { useResearch, type ResearchItem } from "@/hooks/useResearch";
import { useSiteSettings, DEFAULT_SETTINGS } from "@/context/SettingsContext";
import { api } from "@/lib/api";
import Toggle from "../components/Toggle";

function generateId(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

const EMPTY_ITEM: Omit<ResearchItem, "id"> = {
  title: "",
  description: "",
  icon: "",
  published: true,
};

export default function ResearchAdmin() {
  const { data, loading, refetch } = useResearch(true);
  const { settings, setSettings } = useSiteSettings();
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [headerData, setHeaderData] = useState({
    researchTitle: "",
    researchHeading: "",
    researchDescription: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data) setItems(data);
    if (settings) {
      setHeaderData({
        researchTitle: settings.siteContent?.researchTitle || DEFAULT_SETTINGS.siteContent.researchTitle,
        researchHeading: settings.siteContent?.researchHeading || DEFAULT_SETTINGS.siteContent.researchHeading,
        researchDescription: settings.siteContent?.researchDescription || DEFAULT_SETTINGS.siteContent.researchDescription,
      });
    }
  }, [data, settings]);

  const update = (id: string, patch: Partial<ResearchItem>) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const addNew = () => {
    const newItem: ResearchItem = { id: `new-${Date.now()}`, ...EMPTY_ITEM };
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

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
    // Assign clean IDs to any new items based on their title
    const toSave = items.map((item) => ({
      ...item,
      id: item.id.startsWith("new-") ? generateId(item.title) || item.id : item.id,
    }));
    try {
      await api.put("/research", toSave);
      const savedSettings = await api.put<typeof settings>("/settings", {
        ...settings,
        siteContent: {
          ...settings?.siteContent,
          ...headerData,
        },
      });
      setSettings(savedSettings);
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Research</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your research themes. Toggle visibility per item.
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

      {/* Feedback */}
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

      {/* Section Header */}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">Section Header Text</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Section Title (Eyebrow)</label>
            <input
              value={headerData.researchTitle}
              onChange={(e) => setHeaderData({ ...headerData, researchTitle: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Heading</label>
            <input
              value={headerData.researchHeading}
              onChange={(e) => setHeaderData({ ...headerData, researchHeading: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-zinc-400">Description</label>
            <textarea
              rows={2}
              value={headerData.researchDescription}
              onChange={(e) => setHeaderData({ ...headerData, researchDescription: e.target.value })}
              className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
        </div>
      </div>

      {/* Item list */}
      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <div className="rounded-xl border border-zinc-800 p-8 text-center text-sm text-zinc-500">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 p-8 text-center text-sm text-zinc-500">
            No research items yet. Click "Add Item" to create one.
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
                {/* Card header */}
                <div className="flex items-center gap-3">
                  {/* Up/Down */}
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

                  {/* Icon preview */}
                  {item.icon && (
                    <span className="material-symbols-rounded text-brand-400 text-[20px]">
                      {item.icon}
                    </span>
                  )}

                  {/* Title */}
                  <p className="flex-1 text-sm font-medium text-zinc-200 truncate">
                    {item.title || <span className="italic text-zinc-500">Untitled</span>}
                  </p>

                  {/* Published toggle */}
                  <Toggle
                    checked={item.published}
                    onChange={() => update(item.id, { published: !item.published })}
                    label={`Toggle ${item.title} visibility`}
                  />

                  {/* Edit / Delete */}
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

                {/* Expanded fields */}
                {isEditing && (
                  <div className="mt-4 grid gap-4 border-t border-zinc-800 pt-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
                      <input
                        value={item.title}
                        onChange={(e) => update(item.id, { title: e.target.value })}
                        placeholder="e.g. Crop Disease Detection"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => update(item.id, { description: e.target.value })}
                        rows={3}
                        placeholder="A short description of this research area..."
                        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">
                        Icon{" "}
                        <span className="text-zinc-500 font-normal">
                          (Material Symbols name, e.g. <code className="text-zinc-400">biotech</code>)
                        </span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          value={item.icon}
                          onChange={(e) => update(item.id, { icon: e.target.value })}
                          placeholder="biotech"
                          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                     text-sm text-zinc-200 placeholder:text-zinc-600
                                     focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                        />
                        {item.icon && (
                          <span className="material-symbols-rounded text-brand-400 text-[24px]">
                            {item.icon}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        Browse icons at{" "}
                        <a
                          href="https://fonts.google.com/icons"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-400 hover:underline"
                        >
                          fonts.google.com/icons
                        </a>
                      </p>
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
