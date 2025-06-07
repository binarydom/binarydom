import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";
import { execSync } from "child_process";

interface CreateOptions {
  template: string;
}

export async function create(name: string, options: CreateOptions) {
  const { template } = options;
  const projectDir = resolve(process.cwd(), name);

  try {
    // Create project directory
    await mkdir(projectDir, { recursive: true });

    // Create package.json
    const packageJson = {
      name,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "binarydom dev",
        build: "binarydom build",
        serve: "binarydom serve",
      },
      dependencies: {
        binarydom: "latest",
      },
      devDependencies: {
        typescript: "^4.9.0",
        "@types/node": "^18.0.0",
      },
    };

    await writeFile(
      resolve(projectDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Create tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "node",
        esModuleInterop: true,
        strict: true,
        jsx: "react",
        sourceMap: true,
        outDir: "dist",
        baseUrl: ".",
        paths: {
          "@/*": ["src/*"],
        },
      },
      include: ["src/**/*"],
      exclude: ["node_modules"],
    };

    await writeFile(
      resolve(projectDir, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2)
    );

    // Create source directory and initial files
    await mkdir(resolve(projectDir, "src"));

    // Create index.ts
    const indexContent = `
import { BinaryDOMRenderer } from 'binarydom';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const renderer = new BinaryDOMRenderer(container);
renderer.render(App());
`;

    await writeFile(resolve(projectDir, "src/index.ts"), indexContent);

    // Create App.ts
    const appContent = `
import { BinaryDOMNode, NodeType } from 'binarydom';

export function App(): BinaryDOMNode {
  return {
    type: 'div' as NodeType,
    props: {
      children: [
        {
          type: 'h1' as NodeType,
          props: {
            children: ['Welcome to BinaryDOM']
          },
          id: 'title',
          attributes: new Map(),
          children: [],
          left: null,
          right: null,
          checksum: 0,
          isDirty: false,
          value: '',
          eventHandlers: new Map(),
          state: null,
          hooks: [],
          parent: null,
          fiber: {
            alternate: null,
            child: null,
            sibling: null,
            return: null,
            pendingProps: {},
            memoizedProps: {},
            memoizedState: undefined,
            updateQueue: null,
            flags: 0
          }
        }
      ]
    },
    id: 'app',
    attributes: new Map(),
    children: [],
    left: null,
    right: null,
    checksum: 0,
    isDirty: false,
    value: '',
    eventHandlers: new Map(),
    state: null,
    hooks: [],
    parent: null,
    fiber: {
      alternate: null,
      child: null,
      sibling: null,
      return: null,
      pendingProps: {},
      memoizedProps: {},
      memoizedState: undefined,
      updateQueue: null,
      flags: 0
    }
  };
}
`;

    await writeFile(resolve(projectDir, "src/App.ts"), appContent);

    // Create index.html
    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.ts"></script>
  </body>
</html>
`;

    await writeFile(resolve(projectDir, "index.html"), htmlContent);

    // Install dependencies
    console.log("Installing dependencies...");
    execSync("npm install", { cwd: projectDir, stdio: "inherit" });

    console.log(`
🎉 Successfully created BinaryDOM project "${name}"!

To get started:
  cd ${name}
  npm run dev

Available commands:
  npm run dev    - Start development server
  npm run build  - Build for production
  npm run serve  - Serve production build
`);
  } catch (error) {
    console.error("Failed to create project:", error);
    process.exit(1);
  }
}
