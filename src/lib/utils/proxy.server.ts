import { error } from "@sveltejs/kit";

/**
 * First-party replacement for the old external `DEFAULT_CORS_PROXY`
 * (https://mywebapp.abcworker.workers.dev/).
 *
 * Cross-origin resources are fetched from the server instead of the browser,
 * so browser CORS restrictions never apply. Targets are restricted to the
 * hosts this app actually needs, private/internal addresses are rejected and
 * every upstream request is aborted after {@link PROXY_TIMEOUT_MS}.
 *
 * This module is server-only (`.server.ts`) and must never be imported from
 * client code.
 */

/** Abort upstream requests after 10 seconds. */
export const PROXY_TIMEOUT_MS = 10_000;

/** Maximum number of upstream redirects that will be followed. */
const MAX_REDIRECTS = 3;

/**
 * Base hosts the proxy is allowed to contact. A host matches when it is equal
 * to an entry or is a sub-domain of one (e.g. `www.getdailyart.com` matches
 * `getdailyart.com`). Add entries here if a new remote API is needed.
 */
const ALLOWED_HOSTS = ["getdailyart.com", "hymetnet.gov.vn"];

/**
 * Request headers that are forwarded to the upstream server. Everything else
 * (cookies, authorization, ...) is dropped so credentials can never leak to a
 * third party through the proxy.
 */
export const PROXY_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "cache-control",
  "if-none-match",
  "if-modified-since",
  "range",
] as const;

/**
 * Response headers relayed back to the browser. This is an allow list, so
 * `set-cookie` and other sensitive headers are never forwarded.
 */
const RELAYED_RESPONSE_HEADERS = [
  "content-type",
  "cache-control",
  "etag",
  "last-modified",
  "expires",
  "content-language",
  "content-disposition",
] as const;

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export type ProxyFetchOptions = {
  /** Headers to send upstream, merged over the defaults. */
  headers?: Record<string, string>;
};

/**
 * Validates `rawUrl` and returns it as a {@link URL}.
 * Throws a SvelteKit HTTP error when the target is not allowed, so callers
 * can let it bubble up to SvelteKit (do not swallow it in a broad `catch`).
 */
export function assertProxyTarget(rawUrl: string): URL {
  let target: URL | null = null;
  try {
    target = new URL(rawUrl);
  } catch {
    target = null;
  }

  if (!target) {
    error(400, "Invalid target url");
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    error(400, "Only http and https targets are supported");
  }
  if (!isAllowedHost(target.hostname)) {
    error(403, `Target host is not allowed: ${target.hostname}`);
  }
  if (isPrivateHost(target.hostname)) {
    error(403, "Target host points to a private network");
  }

  return target;
}

/**
 * Fetches an allow-listed URL from the server. Redirects are followed
 * manually so that every hop is re-validated against the allow list.
 */
export async function proxyFetch(
  rawUrl: string,
  options: ProxyFetchOptions = {},
): Promise<Response> {
  const target = assertProxyTarget(rawUrl);

  const headers = new Headers({ accept: "*/*" });
  for (const [name, value] of Object.entries(options.headers ?? {})) {
    headers.set(name, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    let current = target;

    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      const response = await fetch(current, {
        headers,
        redirect: "manual",
        signal: controller.signal,
      });

      const location = response.headers.get("location");
      if (!REDIRECT_STATUSES.has(response.status) || !location) {
        return response;
      }

      // Throw the redirect body away and validate the next hop.
      await response.body?.cancel();
      current = assertProxyTarget(new URL(location, current).href);
    }

    error(502, "Too many redirects from the upstream server");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Copies the safe upstream headers onto a new response whose body is the
 * upstream stream, so the resource can be relayed without buffering it.
 */
export function relayedResponse(upstream: Response): Response {
  const headers = new Headers();
  for (const name of RELAYED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

/**
 * Best-effort block for private/internal addresses. The allow list is the
 * primary defence; this is a second layer in case a host is ever added that
 * resolves to a local address.
 */
function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  // IPv4 literals, e.g. 127.0.0.1 or 192.168.1.10
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [first, second] = ipv4.slice(1).map(Number);
    if (ipv4.slice(1).some((octet) => Number(octet) > 255)) return false;
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  }

  // IPv6 literals, e.g. [::1], [fd00::1] or [::ffff:127.0.0.1]
  if (host.includes(":")) {
    if (
      host === "::" ||
      host === "::1" ||
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      /^fe[89ab]/.test(host)
    ) {
      return true;
    }

    const mapped = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) return isPrivateHost(mapped[1]);

    return false;
  }

  return false;
}
