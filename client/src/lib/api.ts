/**
 * Tiny fetch wrapper for talking to the Cloudflare Worker API.
 */
const envUrl = import.meta.env.VITE_API_URL;
const BASE_URL = envUrl 
  ? (envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`) 
  : "http://localhost:8787/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function headers(token?: string, contentType: string | null = "application/json"): HeadersInit {
  const h: HeadersInit = {};
  if (contentType) h["Content-Type"] = contentType;
  const activeToken = token || localStorage.getItem("admin-token");
  if (activeToken) h["Authorization"] = `Bearer ${activeToken}`;
  return h;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error ?? body.message ?? message;
    } catch {
      // non-JSON error body; keep statusText
    }
    throw new ApiError(message, res.status);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }
  
  const text = await res.text();
  if (!text) return undefined as T;
  
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  get: <T>(path: string, token?: string) => 
    request<T>(path, { headers: headers(token) }),
    
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", headers: headers(token), body: JSON.stringify(body) }),
    
  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PATCH", headers: headers(token), body: JSON.stringify(body) }),
    
  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PUT", headers: headers(token), body: JSON.stringify(body) }),
    
  del: <T>(path: string, token?: string) => 
    request<T>(path, { method: "DELETE", headers: headers(token) }),
    
  upload: <T>(path: string, body: FormData, token?: string) =>
    request<T>(path, { method: "POST", headers: headers(token, null), body })
};
