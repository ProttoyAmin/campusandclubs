/**
 * WebSocket / realtime provider (chat + notifications).
 *
 * Drop your existing SocketProvider here once porting realtime. Empty
 * shell so root.tsx can be flipped on later without restructuring.
 */
import { createContext, useContext, type ReactNode } from "react";

const SocketContext = createContext<unknown>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  // TODO: init WS, handle connect/disconnect, expose send/on.
  return (
    <SocketContext.Provider value={null}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
