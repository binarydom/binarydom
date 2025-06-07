import { build as esbuild } from "esbuild";
import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";

interface BuildOptions {
  outDir: string;
  minify: boolean;
}

export async function build(options: BuildOptions) {
  const { outDir, minify } = options;

  try {
    // Read package.json for entry point
    const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
    const entryPoint = packageJson.main || "src/index.ts";

    // Build the application
    const result = await esbuild.build({
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

    writeFileSync(resolve(outDir, "index.html"), html);

    console.log("Build completed successfully!");
    console.log(`Output directory: ${outDir}`);
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}
