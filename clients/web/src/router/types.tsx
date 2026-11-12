import type { ComponentType, ReactNode } from "react";
import type {
    LoaderFunctionArgs,
    ActionFunctionArgs,
    ShouldRevalidateFunction,
    LoaderFunction,
    ActionFunction,
    RouteObject
} from "react-router-dom";
import { useMatches } from "react-router-dom";


export interface RouteHandle {
    label?: string
    crumb?: { label: string; backTo?: string } | false
}

export interface RouteMeta {
    title: string;
    description?: string;
}

export type RouteNode = {
    id?: string;
    path?: string;
    index?: boolean;
    element?: ReactNode;
    lazy?: () => Promise<{
        Component: ComponentType<unknown>;
        Action?: ActionFunction;
        Loader?: LoaderFunction;
    }>;
    loader?: (args: LoaderFunctionArgs) => Response | Promise<Response> | unknown;
    action?: (args: ActionFunctionArgs) => Response | Promise<Response> | unknown;
    shouldRevalidate?: ShouldRevalidateFunction;
    handle?: RouteHandle;
    meta?: RouteMeta;
    children?: RouteNode[]
}

export type RouteMatch = {
    id: string; pathname: string;
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