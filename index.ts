import { glob } from "glob";
import { readFile, unlink } from "node:fs/promises";

const contentsToRemove = [
  `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`,
  `export {};
`,
  `#!/usr/bin/env node
export {};
`,
];

async function main() {
  const [_, __, ...patterns] = process.argv;
  if (patterns.length === 0) {
    console.error("Please provide a directory path.");
    process.exit(1);
  }

  let status = 0;

  for (const pattern of patterns) {
    await removeEmptyJsFiles(pattern);
  }

  process.exit(status);

  async function removeEmptyJsFiles(pattern: string) {
    try {
      const files = await glob(pattern);
      for (const file of files) {
        const content = await readFile(file, "utf-8");
        if (contentsToRemove.indexOf(content) !== -1) {
          await unlink(file);
          console.log(`Removed: ${file}`);
        }
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      status = 1;
    }
  }
}

main().catch((error) => console.error(error));
