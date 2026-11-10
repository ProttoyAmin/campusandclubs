/**
 * Per-route <head> metadata — title & description, extensible later
 * (OG, canonical, JSON-LD).
 *
 * The server calls `collectMeta()` after rendering; the client syncs it
 * into document.title/<meta> tags as routes change.
 */
import { APP_NAME } from "@/config/constants";

export interface PageMeta {
  title: string;
  description?: string;
}

export function withAppName(title: string): string {
  return `${title} • ${APP_NAME}`;
}

function setTag(selector: string, attr: "name" | "property", key: string, content: string | null): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (content === null || content === undefined) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function applyMeta(meta: PageMeta): void {
  document.title = meta.title;
  setTag(`meta[name="description"]`, "name", "description", meta.description ?? null);
}

/** Simple server-side rendering of the <head> tags. */
export function renderMeta(meta: PageMeta): string {
  const parts: string[] = [];
  parts.push(`<title>${escapeHtml(meta.title)}</title>`);
  if (meta.description) {
    parts.push(
      `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    );
  }
  return parts.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
