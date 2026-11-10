/**
 * Helpers to embed/extract dehydrated react-query state from the SSR HTML.
 *
 * The server serialises the dehydrated QueryClient state into a
 * <script> tag attached just before </body>. The client reads this
 * once during hydration and feeds it to the singleton QueryClient.
 */
import { useEffect } from "react";

const STATE_KEY = "__RQ_STATE__";

export function serializeDehydratedState(state: unknown): string {
  return `<script id="${STATE_KEY}" type="application/json">${
    JSON.stringify(state).replace(/</g, "\\u003c")
  }</script>`;
}

export function extractDehydratedState(document: Document = window.document): unknown | null {
  const node = document.getElementById(STATE_KEY);
  if (!node) return null;
  try {
    return JSON.parse(node.textContent || "null");
  } catch {
    return null;
  }
}

/** Run once at startup: pick up the dehydrated payload and remove the
 *  tag from the DOM (so it doesn't hang around on client navigations). */
export function useHydrateDehydratedState(): unknown | null {
  const state = extractDehydratedState();
  useEffect(() => {
    const node = document.getElementById(STATE_KEY);
    if (node) node.remove();
  }, []);
  return state;
}
