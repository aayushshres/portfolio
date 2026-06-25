import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(password);
      navigate("/admin");
    } catch (err) {
      setError("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-950 text-zinc-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-6 text-2xl font-bold">Admin Login</h1>
        
        {error && <div className="mb-4 rounded bg-red-900/50 p-3 text-sm text-red-200 border border-red-900">{error}</div>}
        
        <div className="mb-4">
          <label className="mb-2 block text-sm text-zinc-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-zinc-100 focus:border-brand-500 focus:outline-none"
            placeholder="Enter password"
            autoFocus
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !password}
          className="w-full rounded-lg bg-zinc-100 p-3 font-semibold text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
