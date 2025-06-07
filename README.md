# BinaryDOM CLI

A command-line interface for creating and managing BinaryDOM applications.

## Installation

```bash
npm install -g binarydom
```

## Usage

### Create a new project

```bash
binarydom create my-app
```

This will create a new BinaryDOM project with the following structure:

```
my-app/
├── src/
│   ├── index.ts
│   └── App.ts
├── index.html
├── package.json
└── tsconfig.json
```

### Development

```bash
cd my-app
npm run dev
```

This starts a development server with Hot Module Replacement (HMR) enabled.

### Build for production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Serve production build

```bash
npm run serve
```

This serves the production build locally.

## Available Commands

- `binarydom create <name>` - Create a new BinaryDOM project
  - Options:
    - `-t, --template <template>` - Template to use (default: "default")

- `binarydom dev` - Start development server
  - Options:
    - `-p, --port <port>` - Port to run the server on (default: 3000)
    - `-h, --host <host>` - Host to run the server on (default: localhost)

- `binarydom build` - Build for production
  - Options:
    - `-o, --outDir <dir>` - Output directory (default: dist)
    - `-m, --minify` - Minify the output (default: true)

- `binarydom serve` - Serve production build
  - Options:
    - `-p, --port <port>` - Port to run the server on (default: 3000)
    - `-h, --host <host>` - Host to run the server on (default: localhost)

## Features

- **Hot Module Replacement (HMR)**: Instant updates during development
- **TypeScript Support**: Built-in TypeScript configuration
- **Production Optimization**: Minification and bundling for production
- **Development Server**: Fast development server with live reload
- **Project Templates**: Create new projects from templates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
