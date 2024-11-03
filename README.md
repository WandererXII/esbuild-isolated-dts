# esbuild-isolated-dts

[![Continuous Integration](https://github.com/WandererXII/esbuild-isolated-dts/workflows/Continuous%20Integration/badge.svg)](https://github.com/WandererXII/esbuild-isolated-dts/actions?query=workflow%3A%22Continuous+Integration%22)
[![npm](https://img.shields.io/npm/v/esbuild-isolated-dts)](https://www.npmjs.com/package/esbuild-isolated-dts)

⚡ Generate declaration files (`.d.ts`) and declaration maps (`.d.ts.map`) much faster than `tsc`.

## Prerequisites

Your project must meet these requirements:

1. Have typescript 5.5+ installed.
2. Have `isolatedDeclarations` set to true in `tsconfig.json`.
3. Follow the isolated [declarations rule](https://www.typescriptlang.org/tsconfig/#isolatedDeclarations).

## Install

```bash
# npm
npm install esbuild-isolated-dts --save-dev
# pnpm
pnpm install esbuild-isolated-dts --save-dev
# yarn
yarn add esbuild-isolated-dts --save-dev
```

## Usage

To generate `.d.ts` and `.d.ts.map` files together with transpiling entire directory to `.js` simply do the following, declaration maps are generated by default:

```typescript
import * as esbuild from 'esbuild';
import { isoldatedDtsPlugin } from 'esbuild-isolated-dts';

await esbuild.build({
  entryPoints: ['src/**/*.ts'],
  format: 'esm',
  target: 'es2017',
  outdir: 'dist',
  plugins: [isoldatedDtsPlugin()],
});
```

## Options

### outdir

- Type: `string`
- Default: `process.cwd()`

Overrides `outdir` in esbuild config for outputting type declaration. Allows outputting type declarations to a different directory.

Note: If `outfile` in esbuild config is used, `outdir` overrides the directory part of `outfile`.

### transpileOptions

- Type: `typescript.TranspileOptions | undefined`
- Default: `undefined`

Typescript configuration. For example you can turn off outputting declaration maps like this:

```typescript
import * as esbuild from 'esbuild';
import { isoldatedDtsPlugin } from 'esbuild-isolated-dts';

await esbuild.build({
  entryPoints: ['src/**/*.ts'],
  format: 'esm',
  target: 'es2017',
  outdir: 'dist',
  plugins: [
    isoldatedDtsPlugin({
      transpileOptions: {
        compilerOptions: {
          declarationMap: false,
        },
      },
    }),
  ],
});
```

Note: `rootDir` and `outDir` can't be directly modified, because these fields are necessary for correct declaration map output.

### exts

- Type: `string[]`
- Default: `['ts', 'tsx']`

Generate declarations only for files with the extension in `exts`.

### dryRun

- Type: `boolean`
- Default: `false`

Doesn't ouput any files, useful together with `logLevel: 'debug'`

### logLevel

- Type: `'debug' | 'silent'`
- Default: `'silent'`

Outputs extra information when set to `'debug'`

## Credits

Inspired by/alternative: [unplugin-isolated-decl](https://github.com/unplugin/unplugin-isolated-decl)

## Licence

MIT
