import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/react.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: ['react', 'react-dom'],
    noExternal: [], // Ensure no external deps are bundled if not needed
});
