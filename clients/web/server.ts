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

  app.use("/{*splat}", async (req, res, next) => {
    const url = req.originalUrl;

    const isAssetPath = /\.[a-zA-Z0-9]+$/.test(url.split("?")[0]);
    const wantsHtml = req.headers.accept?.includes("text/html");

    if (isAssetPath || !wantsHtml) return next();

    try {
      let template = fs.readFileSync(
        path.resolve(import.meta.dirname, "index.html"),
        "utf-8",
      );

      template = await vite.transformIndexHtml(url, template);

      const [htmlStart, htmlEnd] = template.split("<!--ssr-outlet-->");
      const { render } = await vite.ssrLoadModule("/src/app.server.tsx");

      let didError = false;

      await render({
        url,
        onShellReady(stream, { dehydratedStateScript, metaTags, status }) {
          res.status(didError ? 500 : status);
          res.set({ "Content-Type": "text/html" });

          // Inject meta into <head> and dehydrated state just before </body>.
          let head = htmlStart.replace("<!--ssr-head-->", metaTags);
          const tail = dehydratedStateScript + htmlEnd;

          const transformStream = new Transform({
            transform(chunk, _encoding, callback) {
              res.write(chunk);
              callback();
            },
          });
          transformStream.on("finish", () => res.end(tail));

          res.write(head);
          stream.pipe(transformStream);
        },
        onShellError(error: unknown) {
          vite.ssrFixStacktrace(error as Error);
          console.error(error);
          res.status(500).set({ "Content-Type": "text/html" }).end("<h1>Something went wrong</h1>");
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
