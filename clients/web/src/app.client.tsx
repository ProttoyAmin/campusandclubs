import { hydrateRoot } from "react-dom/client";
import './App.css';
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { getClientQueryClient, HydrationBoundary, queryClient } from "./config/query-client";
import { AppProviders } from "./providers/app-providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./providers/theme-provider";
import { StrictMode, type ReactElement } from "react";
import { routes } from "./routes";
import { MetaUpdater } from "./meta/updater";
import { extractDehydratedState } from "./config/dehydration";

const router = createBrowserRouter(routes);
// const dehydratedState = extractDehydratedState();

// export function createClientApp(routes: RouteObject[], dehydratedState: unknown): ReactElement {
//     const queryClient = getClientQueryClient();
//     const router = createBrowserRouter(routes);

//     return (
//         <AppProviders queryClient={queryClient}>
//             <HydrationBoundary state={dehydratedState}>
//                 <ThemeProvider>
//                     <MetaUpdater />
//                     <RouterProvider router={router} />
//                 </ThemeProvider>
//             </HydrationBoundary>
//         </AppProviders>
//     );
// }


hydrateRoot(
    document.getElementById("root")!,
    <AppProviders queryClient={queryClient}>
        <StrictMode>
            {/* <ReactQueryDevtools initialIsOpen={false} position="top" buttonPosition="top-right" /> */}
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>
        </StrictMode>
    </AppProviders>
);