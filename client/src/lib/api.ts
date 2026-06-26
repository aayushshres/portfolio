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

function headers(contentType: string | null = "application/json"): HeadersInit {
  const h: HeadersInit = {};
  if (contentType) h["Content-Type"] = contentType;
  return h;
}

interface CustomRequestInit extends RequestInit {
  _retry?: boolean;
}

async function request<T>(path: string, init?: CustomRequestInit): Promise<T> {
  const fetchInit: RequestInit = {
    ...init,
    credentials: "include", // Send cookies
  };

  let res = await fetch(`${BASE_URL}${path}`, fetchInit);

  // If 401 and we haven't retried, try to refresh
  if (res.status === 401 && !init?._retry && path !== "/auth/login" && path !== "/auth/refresh") {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      
      if (refreshRes.ok) {
        // Retry original request
        const retryInit = { ...fetchInit, _retry: true } as CustomRequestInit;
        res = await fetch(`${BASE_URL}${path}`, retryInit);
      }
    } catch {
      // Ignore refresh error, let the 401 fall through
    }
  }

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
  get: <T>(path: string) => 
    request<T>(path, { headers: headers() }),
    
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", headers: headers(), body: JSON.stringify(body) }),
    
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", headers: headers(), body: JSON.stringify(body) }),
    
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", headers: headers(), body: JSON.stringify(body) }),
    
  del: <T>(path: string) => 
    request<T>(path, { method: "DELETE", headers: headers() }),
    
  upload: <T>(path: string, body: FormData) =>
    request<T>(path, { method: "POST", headers: headers(null), body })
};
