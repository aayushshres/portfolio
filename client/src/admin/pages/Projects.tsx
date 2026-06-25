import { useState, useEffect } from "react";
import { useProjects, type Project } from "@/hooks/useProjects";
import { api } from "@/lib/api";
import Toggle from "../components/Toggle";

function generateId(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

type ProjectWithTagsInput = Project & { tagsInput: string };

const EMPTY_ITEM: Omit<ProjectWithTagsInput, "id"> = {
  title: "",
  description: "",
  imgSrc: "",
  tags: [],
  tagsInput: "",
  projectLink: "",
  repoLink: "",
  order: 0,
  published: true,
};

const reorder = (arr: ProjectWithTagsInput[]) => arr.map((item, i) => ({ ...item, order: i }));

export default function ProjectsAdmin() {
  const { data, loading, refetch } = useProjects(true);
  const [items, setItems] = useState<ProjectWithTagsInput[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      const formatted = data.map((item) => ({
        ...item,
        tagsInput: item.tags.join(", "),
      })).sort((a, b) => a.order - b.order);
      setItems(formatted);
    }
  }, [data]);

  const update = (id: string, patch: Partial<ProjectWithTagsInput>) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const addNew = () => {
    const newItem: ProjectWithTagsInput = { id: `new-${Date.now()}`, ...EMPTY_ITEM, order: items.length };
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
  };

  const remove = (id: string) => {
    setItems((prev) => reorder(prev.filter((item) => item.id !== id)));
    if (editingId === id) setEditingId(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return reorder(next);
    });
  };

  const moveDown = (index: number) => {
    setItems((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return reorder(next);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const toSave: Project[] = items.map((item) => {
      const { tagsInput, ...rest } = item;
      return {
        ...rest,
        id: rest.id.startsWith("new-") ? generateId(rest.title) || rest.id : rest.id,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      };
    });
    try {
      await api.put("/projects", toSave);
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
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your projects. They will be displayed in this order.
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
            No projects yet. Click "Add Item" to create one.
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

                  {item.imgSrc && (
                    <img src={item.imgSrc} alt="" className="h-8 w-12 rounded object-cover opacity-70" />
                  )}

                  <p className="flex-1 text-sm font-medium text-zinc-200 truncate flex items-center gap-2">
                    {item.title || <span className="italic text-zinc-500">Untitled</span>}
                    <span className="hidden sm:inline-flex items-center gap-1 ml-2">
                      {item.tagsInput.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                    </span>
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
                      <input
                        value={item.title}
                        onChange={(e) => update(item.id, { title: e.target.value })}
                        placeholder="Project Name"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Description</label>
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) => update(item.id, { description: e.target.value })}
                        placeholder="A short description of this project..."
                        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Image Source (URL)</label>
                      <input
                        value={item.imgSrc}
                        onChange={(e) => update(item.id, { imgSrc: e.target.value })}
                        placeholder="/images/project.jpg"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Tags (comma-separated)</label>
                      <input
                        value={item.tagsInput}
                        onChange={(e) => update(item.id, { tagsInput: e.target.value })}
                        placeholder="React, TypeScript, Tailwind"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Project Link</label>
                      <input
                        type="url"
                        value={item.projectLink}
                        onChange={(e) => update(item.id, { projectLink: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2
                                   text-sm text-zinc-200 placeholder:text-zinc-600
                                   focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-400">Repository Link (Optional)</label>
                      <input
                        type="url"
                        value={item.repoLink || ""}
                        onChange={(e) => update(item.id, { repoLink: e.target.value })}
                        placeholder="https://github.com/..."
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
