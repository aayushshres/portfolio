/**
 * Cloudflare Pages middleware that sets a per-request CSP nonce.
 *
 * Why this exists:
 *   Cloudflare's Bot Fight Mode / Browser Integrity Check injects an inline
 *   <script> into every HTML response. The script contains a unique Ray ID and
 *   timestamp, so its content (and therefore SHA-256 hash) changes on every
 *   request. A static CSP hash in `_headers` can never match it.
 *
 *   Cloudflare's recommended solution: if it sees a `nonce-…` token in the
 *   CSP header, it will automatically apply that same nonce to the scripts it
 *   injects. This middleware generates a fresh nonce per request, sets it on
 *   the CSP header, and adds `nonce="…"` to every inline <script> tag in the
 *   HTML using HTMLRewriter (streaming — no buffering the whole body).
 *
 * Important:
 *   The static `Content-Security-Policy` line in `public/_headers` has been
 *   removed — this middleware is now the sole source of the CSP header so that
 *   there is no duplicate/conflicting header.
 */

interface PagesContext {
  next: () => Promise<Response>;
}

// CSP directives (keep in sync with what was previously in _headers)
function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
    "connect-src 'self' https://aayushshrestha-portfolio.pages.dev https://aayushshrestha.dev https://portfolio-api.aayushshres20.workers.dev",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `script-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
  ].join("; ");
}

/**
 * HTMLRewriter handler that adds `nonce="…"` to <script> elements that contain
 * inline code (i.e. those without a `src` attribute, or with type="application/ld+json").
 *
 * External scripts (<script src="…">) are covered by 'self' and don't need a nonce.
 * However, we add the nonce to ALL script tags for simplicity — it doesn't hurt
 * external scripts and ensures nothing is missed.
 */
class NonceInjector {
  private nonce: string;

  constructor(nonce: string) {
    this.nonce = nonce;
  }

  element(element: Element) {
    // Don't double-add if somehow already present
    if (!element.getAttribute("nonce")) {
      element.setAttribute("nonce", this.nonce);
    }
  }
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const response = await context.next();

  // Only transform HTML responses
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Generate a cryptographically random nonce (base64, URL-safe)
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Use HTMLRewriter to inject nonce into <script> tags (streaming, no buffering)
  const rewritten = new HTMLRewriter()
    .on("script", new NonceInjector(nonce))
    .transform(response);

  // Set the CSP header with the nonce — this replaces the static _headers CSP
  const newHeaders = new Headers(rewritten.headers);
  newHeaders.set("Content-Security-Policy", buildCSP(nonce));
  
  return new Response(rewritten.body, {
    status: rewritten.status,
    statusText: rewritten.statusText,
    headers: newHeaders,
  });
}
