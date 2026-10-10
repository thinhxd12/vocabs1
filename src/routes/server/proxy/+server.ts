import { error, isHttpError } from "@sveltejs/kit";
import {
  PROXY_REQUEST_HEADERS,
  proxyFetch,
  relayedResponse,
} from "$lib/utils/proxy.server";
import type { RequestHandler } from "./$types";

/**
 * First-party CORS bypass: `/server/proxy?url=<absolute url>`.
 *
 * The target is fetched server-side (no browser CORS restrictions) and the
 * response is streamed back through this same origin. Only allow-listed hosts
 * are accepted — see `$lib/utils/proxy.server.ts`.
 */
export const GET: RequestHandler = async ({ url, request }) => {
  const target = url.searchParams.get("url");
  if (!target) error(400, 'Missing required "url" query parameter');

  const headers: Record<string, string> = {};
  for (const name of PROXY_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }

  try {
    const upstream = await proxyFetch(target, { headers });
    return relayedResponse(upstream);
  } catch (e) {
    // `assertProxyTarget` throws 400/403 HTTP errors that must reach the
    // client, so rethrow them; anything else means the upstream fetch failed.
    if (isHttpError(e)) throw e;
    error(502, "Upstream request failed");
  }
};
