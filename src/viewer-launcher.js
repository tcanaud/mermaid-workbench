import { existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseFlags(flags) {
  const opts = { port: 5173, dir: null };

  for (let i = 0; i < flags.length; i++) {
    if ((flags[i] === "--port" || flags[i] === "-p") && flags[i + 1]) {
      opts.port = parseInt(flags[++i], 10);
    } else if ((flags[i] === "--dir" || flags[i] === "-d") && flags[i + 1]) {
      opts.dir = flags[++i];
    }
  }

  return opts;
}

export async function launchViewer(flags = []) {
  const opts = parseFlags(flags);

  // Resolve mermaid directory
  const mermaidDir = opts.dir
    ? resolve(opts.dir)
    : resolve(process.cwd(), ".bmad_output", "mermaid");

  if (!existsSync(mermaidDir)) {
    console.error(`\n  Error: Directory not found: ${mermaidDir}`);
    console.error("  Create it with: npx mermaid-workbench init\n");
    process.exit(1);
  }

  // Set env var for vite.config.ts to pick up
  process.env.MERMAID_DIR = mermaidDir;

  const viewerDir = join(__dirname, "..", "viewer");
  const configFile = join(viewerDir, "vite.config.ts");

  console.log(`\n  mermaid-workbench viewer`);
  console.log(`  Watching: ${mermaidDir}`);
  console.log(`  Port:     ${opts.port}\n`);

  const { createServer } = await import("vite");

  const server = await createServer({
    root: viewerDir,
    configFile,
    server: {
      port: opts.port,
      open: true,
    },
  });

  await server.listen();
  server.printUrls();
}
