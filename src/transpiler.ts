import type { BuildResult, OnEndResult } from 'esbuild';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import ts from 'typescript';
import { diagnosticToPartialMessage } from './util.js';
import type { OptionsI } from './options.js';

export async function transpileDeclaration(
  filePath: string,
  opts: OptionsI,
  result: BuildResult
): Promise<OnEndResult> {
  const code = await fs.readFile(filePath, { encoding: 'utf-8' });

  const transpOpts = opts.transpileOptions,
    compOpts = transpOpts.compilerOptions,
    { outputText, diagnostics, sourceMapText } = ts.transpileDeclaration(code, {
      ...transpOpts,
      fileName: filePath,
    });

  const errors = diagnostics
    ?.filter(d => d.category === ts.DiagnosticCategory.Error)
    .map(d => diagnosticToPartialMessage(d));
  const warnings = diagnostics
    ?.filter(d => d.category === ts.DiagnosticCategory.Warning)
    .map(d => diagnosticToPartialMessage(d));

  const fileRelative = path.relative(compOpts.rootDir, filePath),
    parsedFile = path.parse(fileRelative),
    outDecFilePath = path.join(
      compOpts.outDir,
      parsedFile.dir,
      `${opts.outfile ? path.parse(opts.outfile).name : parsedFile.name}.d${parsedFile.ext}`
    ),
    outMapFilePath = `${outDecFilePath}.map`;

  if (opts.logLevel === 'debug') {
    console.log(
      '\nSource:',
      filePath,
      '\nRelative file path:',
      fileRelative,
      '\nDeclaration output path:',
      outDecFilePath,
      '\nMap output path',
      outMapFilePath
    );
  }

  if (!opts.dryRun) {
    if (opts.write) {
      await fs.mkdir(path.dirname(outDecFilePath), { recursive: true });
      await fs.writeFile(outDecFilePath, outputText);
      if (sourceMapText) await fs.writeFile(outMapFilePath, sourceMapText);
    } else {
      const encoder = new TextEncoder();
      result.outputFiles = result.outputFiles || [];
      result.outputFiles.push({
        path: outDecFilePath,
        hash: '',
        contents: encoder.encode(outputText),
        text: outputText,
      });
      if (sourceMapText)
        result.outputFiles.push({
          path: outMapFilePath,
          hash: '',
          contents: encoder.encode(sourceMapText),
          text: sourceMapText,
        });
    }
  }
  return {
    errors,
    warnings,
  };
}
