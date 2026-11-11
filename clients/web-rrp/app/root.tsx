import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import type { LinksFunction } from "react-router";

import appCss from "@/styles/app.css?url";
import { QueryProvider } from "@/lib/query/client";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/providers/toaster";
// import { SocketProvider } from "@/providers/socket-provider"; // uncomment when wiring chat

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appCss },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <Toaster />
        {/* <SocketProvider> */}
        <Outlet />
        {/* </SocketProvider> */}
      </ThemeProvider>
    </QueryProvider>
  );
}
