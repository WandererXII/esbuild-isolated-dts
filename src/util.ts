import type { Diagnostic } from 'typescript';
import type { PartialMessage } from 'esbuild';
import * as path from 'node:path';

export function deepMerge(base: any, extend: any): void {
  for (const key in extend) {
    if (Object.prototype.hasOwnProperty.call(extend, key)) {
      if (
        Object.prototype.hasOwnProperty.call(base, key) &&
        isPlainObject(base[key]) &&
        isPlainObject(extend[key])
      )
        deepMerge(base[key], extend[key]);
      else base[key] = extend[key];
    }
  }
}

function isPlainObject(o: unknown): boolean {
  if (typeof o !== 'object' || o === null) return false;
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
}

export function resolveOutDir(outdir: string | undefined, outfile: string | undefined): string {
  return assureAbsolute(outdir || (outfile ? path.dirname(outfile) : process.cwd()));
}

export function resolveRootDir(filePaths: string[], outbase: string | undefined): string {
  filePaths = filePaths.map((fp) => assureAbsolute(path.dirname(fp)));
  if (outbase) {
    outbase = assureAbsolute(outbase);
    filePaths = filePaths.concat([outbase]);
  }

  if (filePaths.length === 0) return process.cwd();

  const splitPaths = filePaths.map((fp) => fp.split(path.sep));

  const commonPath = splitPaths[0].filter((segment, i) =>
    splitPaths.every((p) => p[i] === segment),
  );

  return commonPath.join(path.sep);
}

// To generate correct relative source path in d.map, we need consistent file paths
function assureAbsolute(p: string): string {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

export function diagnosticToPartialMessage(d: Diagnostic): PartialMessage {
  const pos = d.file && d.start ? d.file.getLineAndCharacterOfPosition(d.start) : undefined;
  return {
    text: typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText,
    location: {
      namespace: 'file',
      file: d.file?.fileName,
      line: pos?.line !== undefined ? pos.line + 1 : undefined,
      column: pos?.character,
    },
    detail: d,
  };
}
