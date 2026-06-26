import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.get<Message[]>("/messages");
        setMessages(data);
      } catch (err) {
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.del(`/messages/${id}`);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      alert("Failed to delete message");
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold">Messages</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Submissions from the public contact form.
      </p>

      {error && (
        <div className="mt-4 rounded bg-red-900/50 p-3 text-sm text-red-200 border border-red-900">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {loading ? (
          <p className="text-zinc-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
            No messages yet.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 relative group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-zinc-100">{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className="text-sm text-brand-400 hover:underline">
                    {msg.email}
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <time className="text-xs text-zinc-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </time>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-red-500 hover:text-red-400"
                    title="Delete message"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 whitespace-pre-wrap text-sm text-zinc-300">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
