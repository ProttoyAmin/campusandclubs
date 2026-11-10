// components/code-countdown.tsx
import { useEffect, useRef, useState } from "react";

const format = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Props = {
    expiresAt: number;        // epoch ms, computed once when the code was issued
    onExpire?: () => void;
    className?: string;
};

export function CodeCountdown({ expiresAt, onExpire, className }: Props) {
    const remaining = () => Math.max(Math.ceil((expiresAt - Date.now()) / 1000), 0);
    const [left, setLeft] = useState(remaining);
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    useEffect(() => {
        const tick = () => {
            const r = remaining();
            setLeft(r);
            if (r === 0) {
                clearInterval(id);
                onExpireRef.current?.();
            }
        };
        const id = setInterval(tick, 1000);
        tick();
        return () => clearInterval(id);
    }, [expiresAt]);

    return (
        <span className={className}>
            {left > 0 ? `Code expires in ${format(left)}` : "Code expired"}
        </span>
    );
}