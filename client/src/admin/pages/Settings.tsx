import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/context/AuthContext";
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

import Toggle from "../components/Toggle";

export default function Settings() {
  const { settings, setSettings } = useSettings();
  const { logout } = useAuth();
  
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 12) {
      setPasswordError("New password must be at least 12 characters.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setPasswordUpdating(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        logout(); // Force login
      }, 2000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-12">
      <section>
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
      </section>

      <section>
        <h2 className="text-xl font-semibold">Theme Customization</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Change the primary accent color for the website.
        </p>
        <div className="mt-6 rounded-xl border border-zinc-800 p-6 flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Accent Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.theme?.accentColor || "#2d33a8"}
                onChange={async (e) => {
                  const val = e.target.value;
                  const newSettings = { ...settings, theme: { accentColor: val } };
                  setSettings(newSettings); // Optimistic UI update
                  try {
                    await api.put<SiteSettings>("/settings", newSettings);
                  } catch (err) {
                    setErrorMsg("Failed to update accent color");
                  }
                }}
                className="h-10 w-20 rounded border border-zinc-700 bg-zinc-950 p-1 cursor-pointer"
              />
              <span className="text-sm text-zinc-400 font-mono">
                {settings.theme?.accentColor || "#2d33a8"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-red-400">Security</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Update your admin dashboard password. You will be logged out upon success.
        </p>

        <form onSubmit={handlePasswordChange} className="mt-6 rounded-xl border border-zinc-800 p-6 flex flex-col gap-4">
          {passwordError && (
            <div className="rounded bg-red-900/50 p-3 text-sm text-red-200 border border-red-900">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="rounded bg-green-900/50 p-3 text-sm text-green-200 border border-green-900">
              Password updated successfully. Logging you out...
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Current Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={12}
              maxLength={128}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={12}
              maxLength={128}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-password"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-zinc-950"
            />
            <label htmlFor="show-password" className="text-sm text-zinc-400">Show passwords</label>
          </div>

          <button
            type="submit"
            disabled={passwordUpdating || passwordSuccess}
            className="mt-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start"
          >
            {passwordUpdating ? "Updating..." : "Change Password"}
          </button>
        </form>
      </section>
    </div>
  );
}
