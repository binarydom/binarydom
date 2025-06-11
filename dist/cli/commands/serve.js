"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = serve;
const http_1 = require("http");
const path_1 = require("path");
const fs_1 = require("fs");
const mime_types_1 = require("mime-types");
async function serve(options) {
    const { port, host } = options;
    const distDir = (0, path_1.resolve)(process.cwd(), "dist");
    const server = (0, http_1.createServer)((req, res) => {
        if (!req.url) {
            res.statusCode = 400;
            res.end("Bad Request");
            return;
        }
        // Handle root path
        const path = req.url === "/" ? "/index.html" : req.url;
        const filePath = (0, path_1.resolve)(distDir, path.slice(1));
        try {
            const stat = (0, fs_1.statSync)(filePath);
            if (stat.isDirectory()) {
                res.statusCode = 403;
                res.end("Forbidden");
                return;
            }
            const contentType = (0, mime_types_1.lookup)(filePath) || "application/octet-stream";
            res.setHeader("Content-Type", contentType);
            const stream = (0, fs_1.createReadStream)(filePath);
            stream.pipe(res);
            stream.on("error", (error) => {
                console.error("Error serving file:", error);
                res.statusCode = 500;
                res.end("Internal Server Error");
            });
        }
        catch (error) {
            res.statusCode = 404;
            res.end("Not Found");
        }
    });
    server.listen(parseInt(port), host, () => {
        console.log(`Server running at http://${host}:${port}`);
    });
}
