import { createServer } from "http";
import { resolve } from "path";
import { createReadStream, statSync } from "fs";
import { lookup } from "mime-types";

interface ServeOptions {
  port: string;
  host: string;
}

export async function serve(options: ServeOptions) {
  const { port, host } = options;
  const distDir = resolve(process.cwd(), "dist");

  const server = createServer((req, res) => {
    if (!req.url) {
      res.statusCode = 400;
      res.end("Bad Request");
      return;
    }

    // Handle root path
    const path = req.url === "/" ? "/index.html" : req.url;
    const filePath = resolve(distDir, path.slice(1));

    try {
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }

      const contentType = lookup(filePath) || "application/octet-stream";
      res.setHeader("Content-Type", contentType);

      const stream = createReadStream(filePath);
      stream.pipe(res);

      stream.on("error", (error) => {
        console.error("Error serving file:", error);
        res.statusCode = 500;
        res.end("Internal Server Error");
      });
    } catch (error) {
      res.statusCode = 404;
      res.end("Not Found");
    }
  });

  server.listen(parseInt(port), host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}
