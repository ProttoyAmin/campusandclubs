import type {
    RouteObject
} from "react-router-dom";
import { useMatches } from "react-router-dom";
import type {
    RouteHandle,
    RouteMeta,
    RouteNode,
    RouteMatch
} from "./types"
import type { ComponentType } from "react";


export function compileTree(nodes: RouteNode | RouteNode[]): RouteObject[] {
    if (Array.isArray(nodes)) return nodes.map(compileNode);
    return [compileNode(nodes)]
}

export function compileNode(node: RouteNode): RouteObject {
    const route: RouteObject & { handle?: RouteHandle; meta?: RouteMeta } = {}

    if (node.id) route.id = node.id;
    // if (node.index) route.index = true;
    else if (node.path !== undefined) route.path = node.path;

    if (node.element !== undefined) {

        if (typeof node.element === "function") {
            route.Component = node.element as ComponentType<unknown>
        } else {
            route.element = node.element
        }

    }

    if (node.lazy) route.lazy = node.lazy;
    if (node.loader) route.loader = node.loader;
    if (node.action) route.action = node.action;
    if (node.shouldRevalidate) route.shouldRevalidate = node.shouldRevalidate;
    if (node.handle) route.handle = node.handle;
    if (node.meta) route.meta = node.meta;
    if (node.children) route.children = compileTree(node.children);
    return route;
}