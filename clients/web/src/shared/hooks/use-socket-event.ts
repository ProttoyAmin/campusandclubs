// hooks/use-socket-event.ts
import { socket } from "@/library/socket";
import { useEffect } from "react";

export function useSocketEvent(
    type: string,
    handler: (data: unknown) => void,
) {
    useEffect(() => {
        return socket.on(type, handler);
    }, [type, handler]);
}