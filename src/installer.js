import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(__dirname, "..", "templates", "bmad");

function detectBmadDir(projectRoot) {
  if (existsSync(join(projectRoot, "_bmad"))) return "_bmad";
  if (existsSync(join(projectRoot, ".bmad"))) return ".bmad";
  return null;
}

function isModuleInstalled(projectRoot, bmadDir) {
  return existsSync(join(projectRoot, bmadDir, "modules", "mermaid-workbench", "config.yaml"));
}

function copyModule(projectRoot, bmadDir) {
  const src = join(TEMPLATES, "modules", "mermaid-workbench");
  const dest = join(projectRoot, bmadDir, "modules", "mermaid-workbench");

  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function injectManifestYaml(projectRoot, bmadDir) {
  const manifestPath = join(projectRoot, bmadDir, "_config", "manifest.yaml");
  if (!existsSync(manifestPath)) {
    console.log(`    skip manifest.yaml (not found at ${bmadDir}/_config/manifest.yaml)`);
    return;
  }

  const content = readFileSync(manifestPath, "utf-8");
  if (content.includes("name: mermaid-workbench")) {
    console.log("    skip manifest.yaml (mermaid-workbench already registered)");
    return;
  }

  const entry = readFileSync(join(TEMPLATES, "manifests", "manifest-entry.yaml"), "utf-8");
  writeFileSync(manifestPath, content.trimEnd() + "\n" + entry);
  console.log(`    inject ${bmadDir}/_config/manifest.yaml`);
}

function injectCsv(projectRoot, filePath, snippetFile, checkString, label) {
  const fullPath = join(projectRoot, filePath);
  if (!existsSync(fullPath)) {
    console.log(`    skip ${label} (not found at ${filePath})`);
    return;
  }

  const content = readFileSync(fullPath, "utf-8");
  if (content.includes(checkString)) {
    console.log(`    skip ${label} (mermaid-workbench already registered)`);
    return;
  }

  const snippet = readFileSync(join(TEMPLATES, "manifests", snippetFile), "utf-8");
  writeFileSync(fullPath, content.trimEnd() + "\n" + snippet);
  console.log(`    inject ${filePath}`);
}

export function install(flags = []) {
  const projectRoot = process.cwd();

  console.log("\n  mermaid-workbench v1.0.0\n");

  // ── Detect environment ──────────────────────────────
  const bmadDir = detectBmadDir(projectRoot);

  if (!bmadDir) {
    console.error("  Error: No _bmad/ or .bmad/ directory found.");
    console.error("  Run this command from a BMAD project root.\n");
    process.exit(1);
  }

  console.log(`  BMAD detected: ${bmadDir}/`);

  if (isModuleInstalled(projectRoot, bmadDir)) {
    console.log("  Module already installed.");
    console.log("  Re-installing to update templates...\n");
  }

  // ── Step 1: Copy module ─────────────────────────────
  console.log("  [1/3] Installing module...");
  copyModule(projectRoot, bmadDir);
  console.log(`    write ${bmadDir}/modules/mermaid-workbench/`);

  // ── Step 2: Inject manifests ────────────────────────
  console.log("  [2/3] Registering in manifests...");

  injectManifestYaml(projectRoot, bmadDir);

  injectCsv(
    projectRoot,
    join(bmadDir, "_config", "task-manifest.csv"),
    "task-manifest-entries.csv",
    "mermaid-generate-diagram",
    "task-manifest.csv",
  );

  injectCsv(
    projectRoot,
    join(bmadDir, "_config", "bmad-help.csv"),
    "bmad-help-entries.csv",
    "mermaid-workbench",
    "bmad-help.csv",
  );

  injectCsv(
    projectRoot,
    join(bmadDir, "core", "module-help.csv"),
    "module-help-entries.csv",
    "mermaid-workbench",
    "module-help.csv",
  );

  // ── Step 3: Create output directory ─────────────────
  console.log("  [3/3] Ensuring output directory...");
  const outputDir = join(projectRoot, ".bmad_output", "mermaid");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log("    create .bmad_output/mermaid/");
  } else {
    console.log("    skip .bmad_output/mermaid/ (already exists)");
  }

  // ── Done ────────────────────────────────────────────
  console.log();
  console.log("  Done! Mermaid Workbench installed.");
  console.log();
  console.log("  Usage:");
  console.log("    npx mermaid-workbench viewer    Launch the diagram viewer");
  console.log();
  console.log("  BMAD tasks available:");
  console.log("    mermaid-generate    Generate a new Mermaid diagram");
  console.log("    mermaid-update      Update an existing diagram");
  console.log();
}
