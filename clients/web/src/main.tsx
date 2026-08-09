import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
// Side-effect: creates the Authentication singleton which wires up
// the API client's token getter and 401 refresh handler.
// import '@/features/auth/services/authentication';
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/query-client.ts";
import { ThemeProvider } from "./providers/theme-provider.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
