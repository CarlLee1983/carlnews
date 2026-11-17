import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  changedArticlePolicyViolations,
  resolvePolicyBase,
} from "../src/utils/content-policy.mjs";

const CONTENT_DIR = "src/content/news";
const base = resolvePolicyBase(process.argv.slice(2));

/** @param {string} dir */
function listNewsFiles(dir) {
  if (!existsSync(dir)) return [];
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listNewsFiles(rel));
    else if (/\.mdx?$/.test(entry.name)) files.push(rel);
  }
  return files;
}

/** @param {string} ref */
function hasGitRef(ref) {
  try {
    execFileSync("git", ["rev-parse", "--verify", "--quiet", ref], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

let changedFiles;
if (!hasGitRef(base)) {
  changedFiles = listNewsFiles(CONTENT_DIR);
} else {
  try {
    changedFiles = execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=AMR", base, "--", CONTENT_DIR],
      { encoding: "utf8" },
    )
      .split("\n")
      .filter(Boolean)
      .filter((file) => /\.mdx?$/.test(file));
  } catch {
    console.error(`Unable to compare news changes with ${base}.`);
    process.exit(1);
  }
}

const violations = changedFiles.flatMap((file) => {
  const path = resolve(file);
  if (!existsSync(path)) return [];
  return changedArticlePolicyViolations(file, readFileSync(path, "utf8"));
});

if (violations.length > 0) {
  console.error(
    "Content policy failed:\n" +
      violations.map((line) => `- ${line}`).join("\n"),
  );
  process.exit(1);
}

console.log(`Content policy passed for ${changedFiles.length} news file(s).`);
