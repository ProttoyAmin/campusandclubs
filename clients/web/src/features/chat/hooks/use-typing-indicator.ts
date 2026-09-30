import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/library/socket";
import { useSocketEvent } from "@/shared/hooks/use-socket-event";

const TYPING_DEBOUNCE_MS = 200;   // wait before sending "started typing"
const TYPING_TIMEOUT_MS = 3000;   // auto-send "stopped typing" after inactivity
const REMOTE_STALE_MS = 4000;     // safety: clear a remote typer if no refresh arrives

type TypingEventData = {
    chat_id: string;
    user_id: string;
    typer_name: string;
    is_typing: boolean;
};

/**
 * Manages typing indicators for a given chat.
 *
 * - Outbound: debounces keystrokes so a `chat:typing { is_typing: true }` is sent
 *   only once when the user *starts* typing, then a `is_typing: false` is sent
 *   after they stop for TYPING_TIMEOUT_MS. Rapid keystrokes do NOT hit the server.
 *
 * - Inbound: tracks a Map of remote user IDs → display names so group chats can
 *   show "Alice, Bob are typing…" while DMs just show "Alice is typing…".
 *   Each remote typer is auto-cleared after REMOTE_STALE_MS as a fallback.
 */
export function useTypingIndicator(chatId: string | undefined, currentUserId: string | undefined) {
    // ── Outbound state ──────────────────────────────────────────────
    const isSendingTyping = useRef(false);          // tracks what the server currently knows
    const debounceTimer = useRef<ReturnType<typeof setTimeout>>(0);
    const stopTimer = useRef<ReturnType<typeof setTimeout>>(0);

    // ── Inbound state ───────────────────────────────────────────────
    const [typers, setTypers] = useState<Map<string, string>>(new Map());
    const staleTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    // Reset typers when the chat changes
    useEffect(() => {
        setTypers(new Map());
        isSendingTyping.current = false;
        return () => {
            clearTimeout(debounceTimer.current);
            clearTimeout(stopTimer.current);
            staleTimers.current.forEach((t) => clearTimeout(t));
            staleTimers.current.clear();
        };
    }, [chatId]);

    // ── Send helper (only fires when state actually changes) ────────
    const sendTypingEvent = useCallback(
        (isTyping: boolean) => {
            if (!chatId) return;
            if (isSendingTyping.current === isTyping) return; // no-op if already in that state
            isSendingTyping.current = isTyping;
            socket.send("chat:typing", {
                chat_id: chatId,
                is_typing: isTyping,
            });
        },
        [chatId],
    );

    /**
     * Call this on every keystroke in the message input.
     * Internally debounces so the server only sees one "start" event
     * followed by a single "stop" event after the user pauses.
     */
    const handleKeystroke = useCallback(() => {
        // Clear any pending debounce so rapid keys don't spam
        clearTimeout(debounceTimer.current);

        // Clear the stop timer — user is still active
        clearTimeout(stopTimer.current);

        // Debounce the "start typing" signal
        debounceTimer.current = setTimeout(() => {
            sendTypingEvent(true);
        }, TYPING_DEBOUNCE_MS);

        // Schedule a "stop typing" after inactivity
        stopTimer.current = setTimeout(() => {
            clearTimeout(debounceTimer.current);
            sendTypingEvent(false);
        }, TYPING_TIMEOUT_MS);
    }, [sendTypingEvent]);

    /**
     * Immediately signal "stopped typing" — call on send / blur / clear.
     */
    const stopTyping = useCallback(() => {
        clearTimeout(debounceTimer.current);
        clearTimeout(stopTimer.current);
        sendTypingEvent(false);
    }, [sendTypingEvent]);

    // ── Inbound: receive typing events ──────────────────────────────
    const handleTypingEvent = useCallback(
        (data: unknown) => {
            const event = data as TypingEventData;
            // Ignore our own typing events
            if (event.user_id === currentUserId) return;
            // Ignore events for other chats
            if (event.chat_id !== chatId) return;

            setTypers((prev) => {
                const next = new Map(prev);
                if (event.is_typing) {
                    next.set(event.user_id, event.typer_name);
                } else {
                    next.delete(event.user_id);
                }
                return next;
            });

            // Clear previous stale timer for this user
            const existingTimer = staleTimers.current.get(event.user_id);
            if (existingTimer) clearTimeout(existingTimer);

            if (event.is_typing) {
                // Auto-remove after REMOTE_STALE_MS (safety net)
                const timer = setTimeout(() => {
                    setTypers((prev) => {
                        const next = new Map(prev);
                        next.delete(event.user_id);
                        return next;
                    });
                    staleTimers.current.delete(event.user_id);
                }, REMOTE_STALE_MS);
                staleTimers.current.set(event.user_id, timer);
            } else {
                staleTimers.current.delete(event.user_id);
            }
        },
        [chatId, currentUserId],
    );

    useSocketEvent("chat:typing", handleTypingEvent);

    // ── Derived display helpers ─────────────────────────────────────
    const isAnyoneTyping = typers.size > 0;
    const typingNames = Array.from(typers.values());

    /**
     * Returns a human-readable label:
     *   - DM:    "Alice is typing…"
     *   - Group: "Alice is typing…" / "Alice, Bob are typing…" / "3 people are typing…"
     */
    const typingLabel = (() => {
        if (typingNames.length === 0) return "";
        if (typingNames.length === 1) return `${typingNames[0]} is typing…`;
        if (typingNames.length === 2) return `${typingNames.join(" and ")} are typing…`;
        return `${typingNames.length} people are typing…`;
    })();

    return {
        handleKeystroke,
        stopTyping,
        isAnyoneTyping,
        typingNames,
        typingLabel,
    } as const;
}
