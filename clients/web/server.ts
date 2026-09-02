import fs from "node:fs";
import path from "node:path";
import { Transform } from "node:stream";
import express from "express";
import { createServer as createViteServer } from "vite";

const PORT = process.env.VITE_WEB_PORT || 3000;

async function createServer() {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  // app.use("/{*splat}", async (req, res, next) => {
  //   const url = req.originalUrl;

  //   try {
  //     let template = fs.readFileSync(
  //       path.resolve(import.meta.dirname, "index.html"),
  //       "utf-8",
  //     );
  //     template = await vite.transformIndexHtml(url, template);

  //     const [htmlStart, htmlEnd] = template.split("<!--ssr-outlet-->");
  //     const { render } = await vite.ssrLoadModule("/src/app.server.tsx");

  //     let didError = false;

  //     await render(url, {
  //       onShellReady() {
  //         res.status(didError ? 500 : 200);
  //         res.set({ "Content-Type": "text/html" });

  //         const transformStream = new Transform({
  //           transform(chunk, _encoding, callback) {
  //             res.write(chunk);
  //             callback();
  //           },
  //         });

  //         transformStream.on("finish", () => res.end(htmlEnd));

  //         res.write(htmlStart);
  //         // `render` resolved with the { pipe, abort } stream object
  //       },
  //       onShellError(error: unknown) {
  //         vite.ssrFixStacktrace(error as Error);
  //         console.error(error);
  //         res
  //           .status(500)
  //           .set({ "Content-Type": "text/html" })
  //           .end("<h1>Something went wrong</h1>");
  //       },
  //       onError(error: unknown) {
  //         didError = true;
  //         console.error(error);
  //       },
  //     }).then(({ pipe }: { pipe: any }) => {
  //       pipe();
  //     });
  //   } catch (e: any) {
  //     if (e instanceof Response) {
  //       const location = e.headers.get("Location");
  //       if (location) return res.redirect(e.status, location);
  //       return res.status(e.status).end();
  //     }
  //     vite.ssrFixStacktrace(e);
  //     next(e);
  //   }
  // });

  app.use("/{*splat}", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip SSR for anything that isn't a real page request:
    // - file extensions (assets, favicons, source maps, etc.)
    // - Vite/dev-only paths that should've been handled by vite.middlewares already
    // - requests that don't actually want HTML
    const isAssetPath = /\.[a-zA-Z0-9]+$/.test(url.split("?")[0]);
    const wantsHtml = req.headers.accept?.includes("text/html");

    if (isAssetPath || !wantsHtml) {
      return next();
    }

    try {
      let template = fs.readFileSync(
        path.resolve(import.meta.dirname, "index.html"),
        "utf-8",
      );
      template = await vite.transformIndexHtml(url, template);

      const [htmlStart, htmlEnd] = template.split("<!--ssr-outlet-->");
      const { render } = await vite.ssrLoadModule("/src/app.server.tsx");

      let didError = false;

      const { pipe } = await render(url, {
        onShellReady() {
          res.status(didError ? 500 : 200);
          res.set({ "Content-Type": "text/html" });

          const transformStream = new Transform({
            transform(chunk, _encoding, callback) {
              res.write(chunk);
              callback();
            },
          });
          transformStream.on("finish", () => res.end(htmlEnd));

          res.write(htmlStart);
          pipe(transformStream);
        },
        onShellError(error: unknown) {
          vite.ssrFixStacktrace(error as Error);
          console.error(error);
          res
            .status(500)
            .set({ "Content-Type": "text/html" })
            .end("<h1>Something went wrong</h1>");
        },
        onError(error: unknown) {
          didError = true;
          console.error(error);
        },
      });
    } catch (e: any) {
      if (e instanceof Response) {
        const location = e.headers.get("Location");
        if (location) return res.redirect(e.status, location);
        return res.status(e.status).end();
      }
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

createServer();
