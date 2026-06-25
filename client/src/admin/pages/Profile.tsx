import { useState, useEffect } from "react";
import { useProfile, type Profile } from "@/hooks/useProfile";
import { api } from "@/lib/api";

type ProfileFormData = Omit<Profile, "bio" | "interests"> & {
  bioInput: string;
  interestsInput: string;
};

export default function ProfileAdmin() {
  const { data, loading, refetch } = useProfile();
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        bioInput: data.bio.join("\n\n"),
        interestsInput: data.interests.join(", "),
      });
    }
  }, [data]);

  const update = (patch: Partial<ProfileFormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const toSave: Profile = {
      name: formData.name,
      role: formData.role,
      affiliation: formData.affiliation,
      location: formData.location,
      email: formData.email,
      headline: formData.headline,
      tagline: formData.tagline,
      avatar: formData.avatar,
      bio: formData.bioInput.split("\n\n").map(p => p.trim()).filter(Boolean),
      interests: formData.interestsInput.split(",").map(i => i.trim()).filter(Boolean),
    };

    try {
      await api.patch("/profile", toSave);
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
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your main bio, hero text, and basic information.
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

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Name</label>
            <input
              value={formData.name}
              onChange={(e) => update({ name: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Role</label>
            <input
              value={formData.role}
              onChange={(e) => update({ role: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Affiliation</label>
            <input
              value={formData.affiliation}
              onChange={(e) => update({ affiliation: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Location</label>
            <input
              value={formData.location}
              onChange={(e) => update({ location: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => update({ email: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Avatar URL</label>
            <input
              value={formData.avatar}
              onChange={(e) => update({ avatar: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-zinc-400">Headline</label>
            <input
              value={formData.headline}
              onChange={(e) => update({ headline: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-zinc-400">Tagline</label>
            <textarea
              rows={2}
              value={formData.tagline}
              onChange={(e) => update({ tagline: e.target.value })}
              className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-zinc-400">Bio (Paragraphs separated by blank lines)</label>
            <textarea
              rows={6}
              value={formData.bioInput}
              onChange={(e) => update({ bioInput: e.target.value })}
              className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-zinc-400">Interests (comma-separated)</label>
            <input
              value={formData.interestsInput}
              onChange={(e) => update({ interestsInput: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
