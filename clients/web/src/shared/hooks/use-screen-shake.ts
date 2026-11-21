// use-shake-document.ts
import { useCallback, useEffect, useRef } from "react";

export function useShakeDocument(duration = 500, intensity = 10) {
  const animRef = useRef<Animation | null>(null);

  const shake = useCallback(() => {
    navigator.vibrate?.(150); // Android only; iOS ignores it

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (animRef.current?.playState === "running") return;

    const body = document.body;
    const prev = body.style.position;
    body.style.position = "relative";

    const i = intensity;
    const anim = body.animate(
      [0, -i, i, -i, i, -i / 2, 0].map((x) => ({ left: `${x}px` })),
      { duration, easing: "ease-in-out" },
    );

    const restore = () => {
      body.style.position = prev;
    };
    anim.onfinish = restore;
    anim.oncancel = restore;
    animRef.current = anim;
  }, [duration, intensity]);

  useEffect(() => () => animRef.current?.cancel(), []);

  return shake;
}
