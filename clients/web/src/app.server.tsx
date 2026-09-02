import { renderToPipeableStream, type PipeableStream } from "react-dom/server";
import App from "./App";
import './App.css';
import { createQueryClient } from "./config/query-client";
import { AppProviders } from "./providers/app-providers";
import { StrictMode } from "react";
import { ThemeProvider } from "./providers/theme-provider";
import {
    createStaticHandler,
    createStaticRouter,
    StaticRouterProvider,
} from "react-router-dom";
import { routes } from "./routes";


type RenderCallbacks = {
    onShellReady: (stream: PipeableStream) => void;
    onShellError: (error: unknown) => void;
    onError?: (error: unknown) => void;
};


export async function render(url: string, callbacks: RenderCallbacks) {
    const queryClient = createQueryClient();
    const { query, dataRoutes } = createStaticHandler(routes);

    const request = new Request(`http://localhost:3000${url}`);

    const context = await query(request);

    console.log("SSR URL:", url);

    if (context instanceof Response) {
        throw context;
    }

    console.log(
        "SSR matches:",
        context.matches.map((match) => ({
            id: match.route.id,
            pathname: match.pathname,
        }))
    );


    const router = createStaticRouter(dataRoutes, context);

    const stream = renderToPipeableStream(
        <AppProviders queryClient={queryClient}>
            <StrictMode>
                <ThemeProvider>
                    <StaticRouterProvider router={router} context={context} />
                </ThemeProvider>
            </StrictMode>
        </AppProviders>,
        {
            onShellReady() {
                // deferred so `stream` is guaranteed assigned by the time this runs
                queueMicrotask(() => callbacks.onShellReady(stream));
            },
            onShellError(error) {
                callbacks.onShellError(error);
            },
            onError(error) {
                callbacks.onError?.(error);
            },
        }
    );

    return stream;
}