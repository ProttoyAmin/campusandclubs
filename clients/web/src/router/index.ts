import type { RouteObject } from "react-router-dom";
import { compileTree } from "./compile";
import { appTree } from "./tree";
import type { RouteRuntime } from "./types";

/**
 * Build the React Router route objects for one runtime.
 *
 * Server: call once per request with that request's runtime.
 * Browser: call once at boot with the browser runtime.
 */
export function createAppRoutes(runtime: RouteRuntime): RouteObject[] {
    return compileTree(appTree, runtime);
}

export { compileTree, compileNode } from "./compile";
export { resolveInitialLazyRoutes } from "./lazy";
export {
    resolveMeta,
    resolveStatus,
    renderMetaTags,
    applyMeta,
    pageTitle,
    extendMeta,
    DEFAULT_META,
    type MetaMatch,
} from "./meta";
export { RouteMetadata } from "./root";
export { appTree } from "./tree";
export type * from "./types";
