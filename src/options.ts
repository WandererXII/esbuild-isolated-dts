import type { BuildOptions } from 'esbuild';
import type { CompilerOptions, TranspileOptions } from 'typescript';
import { resolveOutDir, resolveRootDir } from './util.js';

export interface Options {
  outdir?: string;
  logLevel?: 'debug' | 'silent';
  dryRun?: boolean;
  transpileOptions?: TranspileOptions;
  exts?: string[];
}

export type OptionsI = Required<
  Omit<Options, 'transpileOptions' | 'outdir' | 'outfile' | 'exts'>
> & {
  transpileOptions: TranspileOptionsI;
  outfile: string | undefined;
  write: boolean;
};

export type TranspileOptionsI = Omit<TranspileOptions, 'compilerOptions'> & {
  compilerOptions: CompilerOptionsI;
};
export type CompilerOptionsI = CompilerOptions &
  Required<Pick<CompilerOptions, 'declarationMap' | 'outDir' | 'rootDir'>>;

export const defaultExts: string[] = ['ts', 'tsx'] as const;

export function initializeOptions(
  opts: Options | undefined,
  buildOpts: BuildOptions,
  filePaths: string[]
): OptionsI {
  const optsI = {
    outfile: filePaths.length === 1 ? buildOpts.outfile : undefined,
    logLevel: opts?.logLevel ?? 'silent',
    dryRun: opts?.dryRun ?? false,
    write: buildOpts.write ?? true,
    transpileOptions: initializeTranspileOptions(opts, buildOpts, filePaths),
  };
  if (optsI.logLevel === 'debug') console.log('Initialized options:', optsI);

  return optsI;
}

function initializeTranspileOptions(
  opts: Options | undefined,
  buildOpts: BuildOptions,
  filePaths: string[]
): TranspileOptionsI {
  const tOpts = opts?.transpileOptions || {};
  tOpts.compilerOptions = tOpts.compilerOptions || {};

  const outDir = resolveOutDir(
      opts?.outdir || buildOpts.outdir,
      filePaths.length === 1 ? buildOpts.outfile : undefined
    ),
    rootDir = resolveRootDir(filePaths, buildOpts.outbase),
    declarationMap = tOpts.compilerOptions.declarationMap ?? true,
    transpileOptionsI: TranspileOptionsI = {
      ...tOpts,
      compilerOptions: {
        ...tOpts.compilerOptions,
        outDir,
        rootDir,
        declarationMap,
      },
    };

  return transpileOptionsI;
}
