import { useEffect, useState } from "react";

interface InviteCountdownProps {
    expiresAt: string | null;
}

function formatTimeLeft(targetDate: string | null): { text: string; isExpired: boolean } {
    // Handle permanent invites (expires_at is null)
    if (!targetDate) {
        return { text: "Never", isExpired: false };
    }

    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
        return { text: "Expired", isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Pad with leading zeros (e.g., "04:09:02")
    const pad = (n: number) => String(n).padStart(2, "0");

    // Discord-style formatting:
    // If > 1 day left, show "6d 14h 22m" or include seconds if you want it ticking
    if (days > 0) {
        return {
            text: `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
            isExpired: false,
        };
    }

    return {
        text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
        isExpired: false,
    };
}

export function InviteCountdown({ expiresAt }: InviteCountdownProps) {
    const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(expiresAt));

    useEffect(() => {
        if (!expiresAt) return;

        // Update immediately in case the prop changed
        const initial = formatTimeLeft(expiresAt);
        setTimeLeft(initial);
        if (initial.isExpired) return;

        const timer = setInterval(() => {
            const updated = formatTimeLeft(expiresAt);
            setTimeLeft(updated);

            // Stop the interval once it hits zero
            if (updated.isExpired) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    return (
        <span
            className={`font-mono text-sm ${timeLeft.isExpired ? "text-destructive font-medium" : "text-muted-foreground"
                }`}
        >
            {timeLeft.text}
        </span>
    );
}