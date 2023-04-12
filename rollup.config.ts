import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

import pkg from './package.json';

const name = pkg.main.replace(/\.js$/, '');

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
});

export default [
  bundle({
    plugins: [
      esbuild({
        minify: true,
      }),
    ],
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
        exports: 'auto',
        sourcemap: false,
      },
      {
        file: `${name}.mjs`,
        format: 'es',
        sourcemap: false,
      },
    ],
  }),
  bundle({
    plugins: [
      dts({
        compilerOptions: {
          outDir: 'dist',
        },
      }),
    ],
    output: {
      file: `${name}.d.ts`,
      format: 'es',
      exports: 'auto',
    },
  }),
];
