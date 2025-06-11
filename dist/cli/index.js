#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const build_1 = require("./commands/build");
const serve_1 = require("./commands/serve");
const dev_1 = require("./commands/dev");
const create_1 = require("./commands/create");
const program = new commander_1.Command();
program
    .name("binarydom")
    .description("CLI for BinaryDOM applications")
    .version("0.1.0");
program
    .command("create")
    .description("Create a new BinaryDOM application")
    .argument("<name>", "name of the application")
    .option("-t, --template <template>", "template to use", "default")
    .action(create_1.create);
program
    .command("dev")
    .description("Start development server with HMR")
    .option("-p, --port <port>", "port to run the server on", "3000")
    .option("-h, --host <host>", "host to run the server on", "localhost")
    .action(dev_1.dev);
program
    .command("build")
    .description("Build the application for production")
    .option("-o, --outDir <dir>", "output directory", "dist")
    .option("-m, --minify", "minify the output", true)
    .action(build_1.build);
program
    .command("serve")
    .description("Serve the built application")
    .option("-p, --port <port>", "port to run the server on", "3000")
    .option("-h, --host <host>", "host to run the server on", "localhost")
    .action(serve_1.serve);
program.parse();
