import path from "node:path";
import { existsSync } from "node:fs";

export function resolveRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    dir = path.resolve(dir, "..");
  }
  return process.cwd();
}

export function resolveDataDir(): string {
  return process.env.OSS402_DATA_DIR ?? path.join(process.cwd(), "data");
}
