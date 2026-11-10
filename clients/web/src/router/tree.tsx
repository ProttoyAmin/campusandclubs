/**
 * Core route tree for production-grade data routers.
 *
 * Why a tree instead of a flat RouteObject[]?
 *   - Strongly typed per-route: `path`, `id`, `element`, `lazy`, `loader`,
 *     `meta`, `handle` (breadcrumbs / nav label / back-link), `children`.
 *   - A single source of truth drives (a) react-router data-router
 *     creation on server & client, (b) <head> metadata, (c) breadcrumb
 *     construction, (d) "active route" / back-link helpers,
 *     (e) permission guards, (f) typed path helpers later.
 *
 * This file declares the type and the compilation helper that turns the
 * tree into react-router's RouteObject[] for both server and client.
 */
import type { ComponentType, ReactNode } from "react";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  ShouldRevalidateFunction,
  LoaderFunction,
  ActionFunction,
  RouteObject,
} from "react-router-dom";
import { useMatches } from "react-router-dom";

/* ------------------------------------------------------------------ */
/* Route node                                                         */
/* ------------------------------------------------------------------ */

export interface RouteMeta {
  title: string;
  description?: string;
  /**
   * When true, this route is not publicly indexable / the page should
   * never be cached at an edge/CDN (e.g. authenticated dashboards).
   */
  secure?: boolean;
}

export interface Crumb {
  id: string;
  label: string;
  pathname: string;
  backTo?: string;
}

export interface RouteHandle {
  /** Breadcrumb label. */
  label?: string;
  /**
   * Breadcrumb descriptor. Preferred over a plain `label` because it can
   * carry a `backTo` override for "up" navigation.
   */
  crumb?: { label: string; backTo?: string } | false;
}

export type RouteNode = {
  id?: string;
  path?: string;
  index?: boolean;
  element?: ReactNode;
  lazy?: () => Promise<{ Component: ComponentType<unknown>; Action?: ActionFunction; Loader?: LoaderFunction }>;
  loader?: (args: LoaderFunctionArgs) => Response | Promise<Response> | unknown;
  action?: (args: ActionFunctionArgs) => Response | Promise<Response> | unknown;
  shouldRevalidate?: ShouldRevalidateFunction;
  meta?: RouteMeta | ((args: { params: Record<string, string | undefined>; data: unknown }) => RouteMeta | Promise<RouteMeta>);
  handle?: RouteHandle;
  children?: RouteNode[];
  /** Rendered around this node's children without consuming a path segment
   *  (pathless layout). */
  layout?: boolean;
};

/* ------------------------------------------------------------------ */
/* Tree → RouteObject[]                                               */
/* ------------------------------------------------------------------ */

/** Compile either a single root node or a list of nodes. */
export function compileTree(nodes: RouteNode | RouteNode[]): RouteObject[] {
  if (Array.isArray(nodes)) return nodes.map(compileNode);
  return [compileNode(nodes)];
}

function compileNode(node: RouteNode): RouteObject {
  const route: RouteObject = {};

  if (node.id) route.id = node.id;
  if (node.index) {
    route.index = true;
  } else if (node.path !== undefined) {
    route.path = node.path;
  }

  if (node.element !== undefined) {
    // Accept either a React element (JSX literal) or a component function.
    if (typeof node.element === "function") {
      route.Component = node.element as ComponentType<unknown>;
    } else {
      route.element = node.element;
    }
  }

  if (node.lazy) route.lazy = node.lazy;
  if (node.loader) route.loader = node.loader;
  if (node.action) route.action = node.action;
  if (node.shouldRevalidate) route.shouldRevalidate = node.shouldRevalidate;
  if (node.handle) route.handle = node.handle;
  // Attach arbitrary fields (like `meta`) so they're accessible from the
  // matched-route record at runtime (both SSR and client navs).
  if (node.meta) (route as RouteObject & { meta?: RouteMeta | ((args: any) => RouteMeta | Promise<RouteMeta>) }).meta = node.meta;
  if (node.children) route.children = compileTree(node.children);

  return route;
}

/* ------------------------------------------------------------------ */
/* Helpers to inspect the compiled/matched tree at runtime            */
/* ------------------------------------------------------------------ */

type RouteMatch = {
  id: string;
  pathname: string;
  params: Record<string, string | undefined>;
  data: unknown;
  handle?: RouteHandle;
};

/** Typed access to the currently matched routes' `handle`s. */
export function useRouteMatches(): RouteMatch[] {
  return useMatches() as unknown as RouteMatch[];
}

/** Build a breadcrumb trail from currently matched routes. */
export function useBreadcrumbs(): Crumb[] {
  const matches = useRouteMatches();
  const out: Crumb[] = [];
  for (const m of matches) {
    if (m.handle?.crumb && m.handle.crumb !== false) {
      out.push({
        id: m.id,
        label: m.handle.crumb.label,
        pathname: m.pathname,
        backTo: m.handle.crumb.backTo,
      });
    } else if (m.handle?.label && m.handle.crumb !== false) {
      out.push({ id: m.id, label: m.handle.label, pathname: m.pathname });
    }
  }
  return out;
}
