"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dev = dev;
const vite_1 = require("vite");
const fs_1 = require("fs");
async function dev(options) {
    const { port, host } = options;
    try {
        // Read package.json for entry point
        const packageJson = JSON.parse((0, fs_1.readFileSync)("package.json", "utf-8"));
        const entryPoint = packageJson.main || "src/index.ts";
        // Create Vite dev server
        const server = await (0, vite_1.createServer)({
            root: process.cwd(),
            server: {
                port: parseInt(port),
                host,
                open: true,
            },
            plugins: [
                {
                    name: "binarydom-hmr",
                    configureServer(server) {
                        // Add HMR support for BinaryDOM components
                        server.ws.on("binarydom:update", (data) => {
                            server.ws.send({
                                type: "custom",
                                event: "binarydom-update",
                                data,
                            });
                        });
                    },
                },
            ],
            build: {
                target: "es2020",
                outDir: "dist",
                sourcemap: true,
            },
        });
        await server.listen();
        console.log(`Dev server running at http://${host}:${port}`);
    }
    catch (error) {
        console.error("Failed to start dev server:", error);
        process.exit(1);
    }
}
