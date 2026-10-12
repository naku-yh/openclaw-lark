import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'index.ts',
    'secret-contract-api': 'secret-contract-api.ts',
  },
  format: 'cjs',
  outExtensions: () => ({ js: '.cjs', dts: '.d.cts' }),
  target: 'node22',
  platform: 'node',
  clean: true,
  outDir: 'dist',
  dts: true,
  deps: {
    neverBundle: [
      /^openclaw(\/.*)?$/,
      /^@larksuiteoapi\//,
      /^@sinclair\//,
      'image-size',
      'zod',
      /^node:/,
    ],
  },
});
