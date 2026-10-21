import { matchPath } from "react-router-dom";

export function isRouteActive(
    pattern: string,
    pathname: string,
    end = true,
): boolean {
    return !!matchPath({ path: pattern, end }, pathname);
}