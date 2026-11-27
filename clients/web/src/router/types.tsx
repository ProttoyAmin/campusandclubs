import type { ComponentType, ReactNode } from "react";
import type {
    LoaderFunctionArgs,
    ActionFunctionArgs,
    ShouldRevalidateFunction,
} from "react-router-dom";
import type { QueryClient } from "@tanstack/react-query";

/* -------------------------------------------------------------------------- */
/*                                   Runtime                                  */
/* -------------------------------------------------------------------------- */

/**
 * Everything a loader/action may need that is owned by the *current* runtime.
 *
 * - On the server a new runtime is created for every document request, so the
 *   QueryClient and request info belong to exactly one visitor.
 * - In the browser one runtime is created for the lifetime of the tab.
 *
 * Loaders receive this as their second argument instead of importing a
 * module-level singleton.
 */
export interface RouteRuntime {
    queryClient: QueryClient;
    /** "server" during SSR, "browser" after hydration. */
    env: "server" | "browser";
    /**
     * Server only: the incoming document request (URL, headers, cookies).
     * Forward only what a backend call needs; never serialize it.
     */
    request?: Request;
}

/* -------------------------------------------------------------------------- */
/*                                    Meta                                    */
/* -------------------------------------------------------------------------- */

export type Robots = "index,follow" | "noindex,nofollow" | "noindex,follow";

export interface RouteMeta {
    title: string;
    description?: string;
    keywords?: string;
    robots?: Robots;
    /** Absolute URL of the social preview image. */
    image?: string;
    /** Absolute canonical URL. Build it from a configured origin, never from Host. */
    canonical?: string;
}

export interface MetaArgs {
    params: Record<string, string | undefined>;
    /** This route's own loader data. */
    data: unknown;
    pathname: string;
}

/** A route's meta: static, or derived from params / its own loader data. */
export type MetaDescriptor =
    | Partial<RouteMeta>
    | ((args: MetaArgs) => Partial<RouteMeta> | null | undefined);

/* -------------------------------------------------------------------------- */
/*                                   Handle                                   */
/* -------------------------------------------------------------------------- */

export interface RouteHandle {
    label?: string;
    crumb?: { label: string; backTo?: string } | false;
    /** Merged root -> leaf; a deeper route overrides its ancestors' fields. */
    meta?: MetaDescriptor;
    /** Forces the HTTP status when this route is the deepest match (e.g. 404). */
    status?: number;
}

/* -------------------------------------------------------------------------- */
/*                                  RouteNode                                 */
/* -------------------------------------------------------------------------- */

export type LazyModule = { default: ComponentType<any> };
export type LazyImporter = () => Promise<LazyModule>;

export type NodeLoader = (
    args: LoaderFunctionArgs,
    runtime: RouteRuntime,
) => unknown | Promise<unknown>;

export type NodeAction = (
    args: ActionFunctionArgs,
    runtime: RouteRuntime,
) => unknown | Promise<unknown>;

/**
 * Authoring format for a route. `compileTree()` turns it into a React Router
 * `RouteObject`, binding loaders/actions to a runtime.
 *
 * Provide exactly one of `Component`, `element` or `page`:
 * - `Component`: eagerly imported component (layouts, shells).
 * - `element`: a pre-built element (rare; e.g. a provider wrapper).
 * - `page`: a dynamic import resolved by React Router's route-level `lazy`,
 *   so SSR waits for it and hydration does not suspend.
 */
export type RouteNode = {
    id?: string;
    path?: string;
    index?: boolean;
    caseSensitive?: boolean;

    Component?: ComponentType<any>;
    element?: ReactNode;
    page?: LazyImporter;

    errorElement?: ReactNode;
    ErrorBoundary?: ComponentType<any>;

    loader?: NodeLoader;
    action?: NodeAction;
    shouldRevalidate?: ShouldRevalidateFunction;

    handle?: RouteHandle;
    /** Shorthand for `handle.meta`. */
    meta?: MetaDescriptor;

    children?: RouteNode[];
};

export type RouteMatch = {
    id: string;
    pathname: string;
    params: Record<string, string | undefined>;
    data: unknown;
    handle?: RouteHandle;
};

export interface Crumb {
    id: string;
    label: string;
    pathname: string;
    backTo?: string;
}
