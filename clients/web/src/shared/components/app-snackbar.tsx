import { useEffect, useState, type AnimationEvent, type HTMLAttributes } from "react";
import { cn } from "design/lib/utils";

type AppSnackbarProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  /** Automatically dismiss after this many milliseconds. Omit to keep it open. */
  durationMs?: number;
};

const AppSnackbar = ({
  open,
  durationMs,
  className,
  children,
  onAnimationEnd,
  ...props
}: AppSnackbarProps) => {
  const [isMounted, setIsMounted] = useState(open);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsExiting(true);
      return;
    }

    setIsMounted(true);
    setIsExiting(false);

    if (durationMs === undefined || durationMs <= 0) return;

    const timer = window.setTimeout(() => setIsExiting(true), durationMs);
    return () => window.clearTimeout(timer);
  }, [open, durationMs]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    onAnimationEnd?.(event);
    if (
      event.target === event.currentTarget &&
      event.animationName === "slideOutDown" &&
      isExiting
    ) {
      setIsMounted(false);
      setIsExiting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notification"
      onAnimationEnd={handleAnimationEnd}
      className={cn(
        "fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border bg-background p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between border border-gray-900",
        isExiting
          ? "animate-[slideOutDown_0.3s_ease-in_forwards]"
          : "animate-[slideInUp_0.3s_ease-out]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default AppSnackbar;
