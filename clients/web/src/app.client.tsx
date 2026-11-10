/**
 * Client entry — hydrates the server-rendered HTML.
 */
import "./App.css";
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { compileTree } from "./router/tree";
import { appRoutes } from "./router/routes.tree";
import { createClientApp } from "./lib/router/client";
import { extractDehydratedState } from "./lib/router/dehydrated-state";
import { StrictMode } from "react";

const routes = compileTree(appRoutes);
const dehydratedState = extractDehydratedState();

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    {createClientApp(routes, dehydratedState)}
  </StrictMode>,
);
