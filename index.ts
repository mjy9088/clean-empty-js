import { glob } from "glob";
import { readFile, unlink } from "node:fs/promises";

const defaultGlobPattern = "**/*.js";
const contentToRemove = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`;

async function removeEmptyJsFiles(pattern: string = defaultGlobPattern) {
  try {
    const files = await glob(pattern);
    for (const file of files) {
      const content = await readFile(file, "utf-8");
      if (content === contentToRemove) {
        await unlink(file);
        console.log(`Removed: ${file}`);
      }
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

async function main() {
  const pattern = process.argv[2] || defaultGlobPattern;
  await removeEmptyJsFiles(pattern);
}

main().catch((error) => console.error(error));
