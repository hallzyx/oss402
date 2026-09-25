#!/usr/bin/env node
import path from "node:path";
import { formatSuiteReport, runConformanceSuite } from "./index.js";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

const mode = (argValue("--mode") ?? "full") as "public" | "full";
const workspaceRel = argValue("--workspace") ?? "apps/demo-valid";
const workspacePath = path.resolve(process.cwd(), workspaceRel.startsWith("apps/") || workspaceRel.startsWith("packages/")
  ? workspaceRel
  : workspaceRel);

// When invoked from package filter, cwd may be the package dir — resolve from monorepo root.
const repoRoot = process.cwd().includes(`${path.sep}packages${path.sep}`) || process.cwd().includes(`${path.sep}apps${path.sep}`)
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const absoluteWorkspace = path.isAbsolute(workspaceRel)
  ? workspaceRel
  : path.resolve(repoRoot, workspaceRel);

const result = await runConformanceSuite({
  workspacePath: absoluteWorkspace,
  mode,
});

console.log(formatSuiteReport(result));
console.log(JSON.stringify({ result: result.result, passed: result.passed, failed: result.failed, total: result.total, report: result.report }, null, 2));

process.exit(result.result === "PASS" ? 0 : 1);
