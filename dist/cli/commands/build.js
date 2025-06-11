"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = build;
const esbuild_1 = require("esbuild");
const path_1 = require("path");
const fs_1 = require("fs");
async function build(options) {
    const { outDir, minify } = options;
    try {
        // Read package.json for entry point
        const packageJson = JSON.parse((0, fs_1.readFileSync)("package.json", "utf-8"));
        const entryPoint = packageJson.main || "src/index.ts";
        // Build the application
        const result = await esbuild_1.build.build({
            entryPoints: [entryPoint],
            bundle: true,
            outdir: outDir,
            minify,
            platform: "browser",
            target: ["es2020"],
            format: "esm",
            sourcemap: true,
            define: {
                "process.env.NODE_ENV": '"production"',
            },
        });
        // Generate HTML entry point
        const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>BinaryDOM App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.js"></script>
  </body>
</html>`;
        (0, fs_1.writeFileSync)((0, path_1.resolve)(outDir, "index.html"), html);
        console.log("Build completed successfully!");
        console.log(`Output directory: ${outDir}`);
    }
    catch (error) {
        console.error("Build failed:", error);
        process.exit(1);
    }
}
