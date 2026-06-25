import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { api } from "@/lib/api";
import type { SectionKey, SiteSettings } from "@/context/SettingsContext";

const SECTION_META: { key: SectionKey; label: string; help: string }[] = [
  {
    key: "research",
    label: "Research",
    help: "Show the research themes section.",
  },
  {
    key: "projects",
    label: "Projects",
    help: "Show the software projects section.",
  },
  {
    key: "publications",
    label: "Publications",
    help: "Show the publications section. Turn on once you have papers to list.",
  },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-brand-500" : "bg-zinc-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { settings, setSettings } = useSettings();
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleSection = async (key: SectionKey) => {
    setUpdating(true);
    setErrorMsg(null);
    const newSettings: SiteSettings = {
      ...settings,
      sections: {
        ...settings.sections,
        [key]: !settings.sections[key],
      },
    };
    try {
      const saved = await api.put<SiteSettings>("/settings", newSettings);
      setSettings(saved);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleCv = async () => {
    setUpdating(true);
    setErrorMsg(null);
    const newSettings: SiteSettings = {
      ...settings,
      cv: {
        ...settings.cv,
        visible: !settings.cv.visible,
      },
    };
    try {
      const saved = await api.put<SiteSettings>("/settings", newSettings);
      setSettings(saved);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Control which sections appear on the public site. Changes apply immediately across all visitors.
      </p>

      {errorMsg && (
        <div className="mt-4 rounded bg-red-900/50 p-3 text-sm text-red-200 border border-red-900">
          {errorMsg}
        </div>
      )}
      {updating && (
        <div className="mt-4 text-sm text-brand-400">Saving changes...</div>
      )}

      <div className="mt-8 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
        {SECTION_META.map(({ key, label, help }) => (
          <div key={key} className="flex items-center justify-between gap-6 p-4">
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-zinc-400">{help}</p>
            </div>
            <Toggle
              checked={settings.sections[key]}
              onChange={() => handleToggleSection(key)}
              label={`Toggle ${label} section`}
            />
          </div>
        ))}
        
        <div className="flex items-center justify-between gap-6 p-4">
          <div>
            <p className="font-medium">Curriculum Vitae</p>
            <p className="text-sm text-zinc-400">Show the inline CV viewer and download section.</p>
          </div>
          <Toggle
            checked={settings.cv.visible}
            onChange={handleToggleCv}
            label="Toggle CV section"
          />
        </div>
      </div>
    </div>
  );
}
