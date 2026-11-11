/**
 * Theme provider (light/dark).
 *
 * Drop your existing ThemeProvider implementation in here. The default
 * export is just a pass-through so the skeleton renders.
 */
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // TODO: wire localStorage / matchMedia dark mode.
  return <>{children}</>;
}
