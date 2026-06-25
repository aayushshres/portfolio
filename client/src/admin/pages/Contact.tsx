import { useState, useEffect } from "react";
import { useContact, type ContactInfo } from "@/hooks/useContact";
import { api } from "@/lib/api";

export default function ContactAdmin() {
  const { data, loading, refetch } = useContact();
  const [formData, setFormData] = useState<ContactInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const update = (patch: Partial<ContactInfo>) => {
    setFormData((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.patch("/contact", formData);
      await refetch();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <div className="text-sm text-zinc-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contact</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage the content for the Contact section.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white
                     hover:bg-brand-500 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
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

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Contact Heading</label>
          <input
            value={formData.contactHeading}
            onChange={(e) => update({ contactHeading: e.target.value })}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Contact Description</label>
          <textarea
            rows={4}
            value={formData.contactDescription}
            onChange={(e) => update({ contactDescription: e.target.value })}
            className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
          />
        </div>
      </div>
    </div>
  );
}
