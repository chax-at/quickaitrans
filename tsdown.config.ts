import { defineConfig } from 'tsdown/config';

export default defineConfig([
  {
    entry: 'src/main.ts',
    outDir: 'dist',
    format: ['esm'],
    target: 'node18',
    clean: true,
    banner: {
      js: '#!/usr/bin/env node'
    }
  }
]);
