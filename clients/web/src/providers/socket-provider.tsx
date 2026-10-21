// providers/socket-provider.tsx
import { useEffect } from "react";
import { useSession } from "@/features/auth/hooks";
import { socket } from "@/library/socket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { data } = useSession();
    const isAuthenticated = data?.meta?.is_authenticated;

    useEffect(() => {
        if (isAuthenticated) {
            socket.connect();
        } else {
            socket.disconnect();
        }
    }, [isAuthenticated]);

    return <>{children}</>;
}