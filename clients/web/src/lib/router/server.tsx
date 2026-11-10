/**
 * Server-side router bootstrap.
 *
 * Exposes `createServerRouter(url)` which builds a per-request
 * QueryClient, compiles our route tree, calls createStaticHandler.query()
 * and returns { router, queryClient, context, dataRoutes } ready for
 * renderToPipeableStream. The caller must call
 * `dehydrate(queryClient)` and embed the result into the HTML so the
 * client can hydrate.
 */
import { createStaticHandler, createStaticRouter, type StaticHandlerContext } from "react-router-dom";
import { createQueryClient, dehydrate } from "./query-client";
import { compileTree, type RouteNode } from "@/router/tree";
import type { QueryClient } from "@tanstack/react-query";
import type { RouteObject } from "react-router-dom";

export interface ServerRouter {
  queryClient: QueryClient;
  dataRoutes: RouteObject[];
  context: StaticHandlerContext;
  router: ReturnType<typeof createStaticRouter>;
}

export async function createServerRouter(url: string, tree: RouteNode | RouteNode[]): Promise<ServerRouter> {
  const queryClient = createQueryClient(); // fresh per request
  const dataRoutes = compileTree(tree);
  const handler = createStaticHandler(dataRoutes);

  const request = new Request(`http://localhost${url}`);
  const context = await handler.query(request);
  if (context instanceof Response) throw context;

  const router = createStaticRouter(dataRoutes, context);
  return { queryClient, dataRoutes, context, router };
}

export function dehydrateState(queryClient: QueryClient) {
  return dehydrate(queryClient);
}
