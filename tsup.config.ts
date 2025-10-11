import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/worker.ts'],
  outDir: 'src',
  format: ['cjs'],
  target: 'node18',
  clean: false,
  splitting: false,
  sourcemap: true,
  dts: false,
  external: ['better-sqlite3', 'drizzle-orm'],
  bundle: true,
  minify: false,
  esbuildOptions: (options) => {
    options.alias = {
      '@': './src'
    };
  }
});