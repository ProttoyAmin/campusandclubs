/**
 * The contract between the Node server (`server/`) and the app's server entry
 * (`src/entry.server.tsx`). Types only, so both tsconfigs can import it.
 */
import type { PipeableStream } from "react-dom/server";

export interface RenderOptions {
    /**
     * Wait for every Suspense boundary before sending the first byte.
     * Use for crawlers so they receive complete HTML; users get streaming.
     */
    waitForAll?: boolean;
}

export interface StreamCallbacks {
    /** Shell (or whole document when `waitForAll`) is ready to pipe. */
    onReady(stream: PipeableStream): void;
    /** The shell itself failed; nothing has been sent yet. */
    onShellError(error: unknown): void;
    /** A recoverable error inside a Suspense boundary. */
    onError(error: unknown): void;
}

export interface DocumentResult {
    kind: "document";
    /** From the matched routes: loader errors, 404 catch-all, etc. */
    status: number;
    /** `<title>`, `<meta>` and `<link rel="canonical">` for this page. */
    head: string;
    /** Serialized TanStack Query cache for the browser to hydrate. */
    stateScript: string;
    /** Start rendering the React tree. */
    stream(callbacks: StreamCallbacks): PipeableStream;
    /** Release request-scoped resources once the response has finished. */
    dispose(): void;
}

export interface ResponseResult {
    kind: "response";
    /** A redirect or a raw Response thrown/returned by a loader. */
    response: Response;
}

export type RenderResult = DocumentResult | ResponseResult;

export type RenderFn = (request: Request, options?: RenderOptions) => Promise<RenderResult>;

export interface ServerEntry {
    render: RenderFn;
}
