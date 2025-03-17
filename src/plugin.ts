import type { PluginBuild } from 'esbuild';
import { defaultExts, initializeOptions, type Options } from './options.js';
import { transpileDeclaration } from './transpiler.js';

export function isoldatedDtsPlugin(opts?: Options) {
  opts = opts || {};
  return {
    name: 'esbuild-isolated-dts',
    setup(build: PluginBuild): void {
      const filePaths: string[] = [],
        buildOpts = build.initialOptions,
        exts = opts.exts || defaultExts,
        filter = new RegExp(`\\.(${exts.join('|')})$`);
      build.onLoad({ filter }, async (args) => {
        filePaths.push(args.path);
        return {};
      });

      build.onEnd(async (result) => {
        const optsI = initializeOptions(opts, buildOpts, filePaths),
          diagnostics = await Promise.all(
            filePaths.map((fp) => transpileDeclaration(fp, optsI, result)),
          );

        return {
          errors: diagnostics.flatMap((d) => d.errors || []),
          warnings: diagnostics.flatMap((d) => d.warnings || []),
        };
      });
    },
  };
}
