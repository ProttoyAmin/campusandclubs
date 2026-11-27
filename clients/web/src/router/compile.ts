import type { RouteObject } from "react-router-dom";
import type { RouteHandle, RouteNode, RouteRuntime } from "./types";

/**
 * Compile authoring `RouteNode`s into React Router `RouteObject`s.
 *
 * Loaders and actions are bound to `runtime`, so the same tree definition is
 * compiled once per server request (fresh QueryClient) and once per browser
 * tab (stable QueryClient). Compiling is cheap: it only builds plain objects,
 * and dynamic imports are cached by the module system.
 */
export function compileTree(nodes: RouteNode[], runtime: RouteRuntime): RouteObject[] {
    return nodes.map((node) => compileNode(node, runtime));
}

export function compileNode(node: RouteNode, runtime: RouteRuntime): RouteObject {
    const handle = buildHandle(node);
    const base = {
        ...(node.id ? { id: node.id } : {}),
        ...(node.caseSensitive ? { caseSensitive: true } : {}),
        ...(node.errorElement !== undefined ? { errorElement: node.errorElement } : {}),
        ...(node.ErrorBoundary ? { ErrorBoundary: node.ErrorBoundary } : {}),
        ...(node.loader ? { loader: bind(node.loader, runtime) } : {}),
        ...(node.action ? { action: bind(node.action, runtime) } : {}),
        ...(node.shouldRevalidate ? { shouldRevalidate: node.shouldRevalidate } : {}),
        ...(handle ? { handle } : {}),
        ...(node.Component ? { Component: node.Component } : {}),
        ...(node.element !== undefined ? { element: node.element } : {}),
        ...(node.page ? { lazy: lazyComponent(node.page) } : {}),
    };

    if (node.index) {
        if (node.children?.length) {
            throw new Error(`Index route "${node.id ?? "?"}" cannot have children.`);
        }
        return { ...base, index: true };
    }

    return {
        ...base,
        ...(node.path !== undefined ? { path: node.path } : {}),
        ...(node.children ? { children: compileTree(node.children, runtime) } : {}),
    };
}

function buildHandle(node: RouteNode): RouteHandle | undefined {
    if (!node.handle && !node.meta) return undefined;
    return { ...node.handle, ...(node.meta ? { meta: node.meta } : {}) };
}

function bind<A>(
    fn: (args: A, runtime: RouteRuntime) => unknown,
    runtime: RouteRuntime,
) {
    return (args: A) => fn(args, runtime);
}

function lazyComponent(importer: NonNullable<RouteNode["page"]>) {
    return async () => {
        const mod = await importer();
        return { Component: mod.default };
    };
}
