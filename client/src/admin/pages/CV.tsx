import { useState } from "react";
import { useCvUrl } from "@/hooks/useCvUrl";
import { api } from "@/lib/api";

export default function CVAdmin() {
  const { url, loading, refetch } = useCvUrl();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.upload("/cv/upload", formData);
      setSuccess(true);
      setFile(null);
      await refetch();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Curriculum Vitae</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Upload a new PDF to replace your current CV. Max file size: 10MB.
      </p>

      {errorMsg && (
        <div className="mt-4 rounded bg-red-900/50 p-3 text-sm text-red-200 border border-red-900">
          {errorMsg}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded bg-green-900/50 p-3 text-sm text-green-200 border border-green-900">
          CV uploaded successfully!
        </div>
      )}

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 font-medium">Current CV</h2>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : url ? (
          <div className="flex items-center gap-4">
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-400 hover:text-brand-300">
              <span className="material-symbols-rounded">description</span>
              View current PDF
            </a>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No CV uploaded yet.</p>
        )}

        <hr className="my-6 border-zinc-800" />

        <h2 className="mb-4 font-medium">Upload New</h2>
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-400 hover:file:bg-zinc-700"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="self-start rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
