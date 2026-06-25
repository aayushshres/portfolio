import { useState, useEffect } from "react";

interface JsonEditorProps<T> {
  title: string;
  description: string;
  data: T | null;
  loading: boolean;
  onSave: (data: T) => Promise<void>;
}

export default function JsonEditor<T>({ title, description, data, loading, onSave }: JsonEditorProps<T>) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      setValue(JSON.stringify(data, null, 2));
    }
  }, [data]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    
    let parsed: T;
    try {
      parsed = JSON.parse(value);
    } catch (err) {
      setError("Invalid JSON formatting. Please check syntax.");
      return;
    }

    setSaving(true);
    try {
      await onSave(parsed);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>

      {error && (
        <div className="mt-4 rounded bg-red-900/50 p-3 text-sm text-red-200 border border-red-900">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded bg-green-900/50 p-3 text-sm text-green-200 border border-green-900">
          Successfully saved changes!
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
          <div className="h-96 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-zinc-500 flex items-center justify-center">
            Loading data...
          </div>
        ) : (
          <textarea
            className="h-96 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-zinc-300 focus:border-brand-500 focus:outline-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
          />
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
