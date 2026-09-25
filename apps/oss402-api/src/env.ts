import dotenv from "dotenv";
import path from "node:path";
import { existsSync } from "node:fs";
import { resolveRepoRoot } from "./paths.js";

let loaded = false;

export function loadRepoEnv() {
  if (loaded) return;
  const root = resolveRepoRoot();
  const candidates = [
    path.join(root, ".env"),
    path.join(root, "apps", "oss402-api", ".env"),
  ];
  for (const file of candidates) {
    if (existsSync(file)) {
      dotenv.config({ path: file });
      loaded = true;
      return;
    }
  }
  dotenv.config();
  loaded = true;
}
