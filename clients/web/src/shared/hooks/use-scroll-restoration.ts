// hooks/use-scroll-restoration.ts
import { useEffect, useLayoutEffect } from "react";

export function useScrollRestoration(
  ref: React.RefObject<HTMLElement>,
  key: string,
) {
  // restore before paint, so user never sees the top flash
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const saved = sessionStorage.getItem(`scroll:${key}`);
    el.scrollTop = saved ? Number(saved) : 0;
  }, [key]);

  // persist as the user scrolls
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      sessionStorage.setItem(`scroll:${key}`, String(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [key]);
}
