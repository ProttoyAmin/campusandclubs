import { hydrateRoot } from "react-dom/client";
import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createQueryClient } from "./config/query-client";
import { AppProviders } from "./providers/app-providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./providers/theme-provider";
import { StrictMode } from "react";
import { routes } from "./routes";

const queryClient = createQueryClient();
const router = createBrowserRouter(routes);

hydrateRoot(
    document.getElementById("root")!,
    <AppProviders queryClient={queryClient}>
        <StrictMode>
            <ReactQueryDevtools initialIsOpen={false} />
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>
        </StrictMode>
    </AppProviders>
);