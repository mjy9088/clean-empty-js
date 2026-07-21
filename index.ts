import { readFile, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "glob";

const recursiveFilePattern = "**/*.{js,d.ts,cjs,mjs,d.cts,d.mts}";

const emptyTypeScriptOutputs = new Set([
  ``,
  `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`,
  `export {};`,
  `define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});`,
  `(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});`,
  `System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});`,
].map(normalizeOutput));

function isEmptyOutput(content: string) {
  return emptyTypeScriptOutputs.has(normalizeOutput(content));
}

function normalizeOutput(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/^#![^\n]*(?:\n|$)/, "")
    .replace(/^\/\/[#@] sourceMappingURL=.*$/gm, "")
    .trim();
}

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
      const files = await glob(await resolvePattern(pattern), { nodir: true });
      for (const file of files) {
        const content = await readFile(file, "utf-8");
        if (isEmptyOutput(content)) {
          await unlink(file);
          console.log(`Removed: ${file}`);
        }
      }
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      status = 1;
    }
  }

  async function resolvePattern(pattern: string) {
    try {
      if ((await stat(pattern)).isDirectory()) {
        return join(pattern, recursiveFilePattern).replace(/\\/g, "/");
      }
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    return pattern;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
