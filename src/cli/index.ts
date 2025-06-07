#!/usr/bin/env node

import { Command } from "commander";
import { build } from "./commands/build";
import { serve } from "./commands/serve";
import { dev } from "./commands/dev";
import { create } from "./commands/create";

const program = new Command();

program
  .name("binarydom")
  .description("CLI for BinaryDOM applications")
  .version("0.1.0");

program
  .command("create")
  .description("Create a new BinaryDOM application")
  .argument("<name>", "name of the application")
  .option("-t, --template <template>", "template to use", "default")
  .action(create);

program
  .command("dev")
  .description("Start development server with HMR")
  .option("-p, --port <port>", "port to run the server on", "3000")
  .option("-h, --host <host>", "host to run the server on", "localhost")
  .action(dev);

program
  .command("build")
  .description("Build the application for production")
  .option("-o, --outDir <dir>", "output directory", "dist")
  .option("-m, --minify", "minify the output", true)
  .action(build);

program
  .command("serve")
  .description("Serve the built application")
  .option("-p, --port <port>", "port to run the server on", "3000")
  .option("-h, --host <host>", "host to run the server on", "localhost")
  .action(serve);

program.parse();
