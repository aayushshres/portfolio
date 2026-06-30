import { useState, useEffect } from "react";
import { useSiteSettings, DEFAULT_SETTINGS } from "@/context/SettingsContext";
import { useProfile } from "@/hooks/useProfile";
import { api } from "@/lib/api";

export default function AboutAdmin() {
  const { settings, setSettings } = useSiteSettings();
  const { data: profileData, loading: profileLoading, refetch: refetchProfile } = useProfile();
  
  const [formData, setFormData] = useState({
    aboutTitle: "",
    aboutHeading: "",
    bioInput: "",
    interestsInput: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings && profileData) {
      setFormData({
        aboutTitle: settings.siteContent?.aboutTitle || DEFAULT_SETTINGS.siteContent.aboutTitle,
        aboutHeading: settings.siteContent?.aboutHeading || DEFAULT_SETTINGS.siteContent.aboutHeading,
        bioInput: profileData.bio.join("\n\n"),
        interestsInput: profileData.interests.join(", "),
      });
    }
  }, [settings, profileData]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const toSaveSettings = {
      ...settings,
      siteContent: {
        ...settings?.siteContent,
        aboutTitle: formData.aboutTitle,
        aboutHeading: formData.aboutHeading,
      },
    };

    const toSaveProfile = profileData ? {
      ...profileData,
      bio: formData.bioInput.split("\n\n").map(p => p.trim()).filter(Boolean),
      interests: formData.interestsInput.split(",").map(i => i.trim()).filter(Boolean),
    } : null;

    try {
      const savedSettings = await api.put<typeof settings>("/settings", toSaveSettings);
      setSettings(savedSettings);
      
      if (toSaveProfile) {
        await api.patch("/profile", toSaveProfile);
        await refetchProfile();
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return <div className="text-sm text-zinc-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">About</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage the text for the About section.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
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
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Section Title</label>
            <input
              value={formData.aboutTitle}
              onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Heading</label>
            <textarea
              rows={2}
              value={formData.aboutHeading}
              onChange={(e) => setFormData({ ...formData, aboutHeading: e.target.value })}
              className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
          </div>
          
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="mb-4 text-sm font-medium text-zinc-300">About Content</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Bio (Paragraphs separated by blank lines)</label>
                <textarea
                  rows={6}
                  value={formData.bioInput}
                  onChange={(e) => setFormData({ ...formData, bioInput: e.target.value })}
                  className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Interests (comma-separated)</label>
                <input
                  value={formData.interestsInput}
                  onChange={(e) => setFormData({ ...formData, interestsInput: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
