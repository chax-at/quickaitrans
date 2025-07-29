import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'src/main.ts',
  output: {
    format: 'cjs',
    minify: true,
    file: 'bin/main.js',
  },
});
