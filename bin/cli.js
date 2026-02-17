#!/usr/bin/env node

import { argv, exit } from "node:process";
import { install } from "../src/installer.js";
import { launchViewer } from "../src/viewer-launcher.js";

const command = argv[2];
const flags = argv.slice(3);

const HELP = `
mermaid-workbench — BMAD module + live viewer for multi-layer Mermaid diagrams.

Usage:
  npx mermaid-workbench init                Install the BMAD module and manifests
  npx mermaid-workbench viewer              Launch the viewer on .bmad_output/mermaid/
  npx mermaid-workbench help                Show this help message

Options (viewer):
  --dir <path>    Watch a custom directory instead of .bmad_output/mermaid/
  --port <port>   Use a custom port (default: 5173)
`;

switch (command) {
  case "init":
    install(flags);
    break;
  case "viewer":
  case "serve":
    launchViewer(flags);
    break;
  case "help":
  case "--help":
  case "-h":
  case undefined:
    console.log(HELP);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.log(HELP);
    exit(1);
}
