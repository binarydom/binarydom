import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const pkg = require('./package.json');

const input = 'src/index.ts';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

const plugins = [
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: true,
    declaration: true,
    declarationDir: 'dist'
  }),
  nodeResolve(),
  commonjs()
];

export default [
  // CommonJS build
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    external,
    plugins
  },
  // ES Module build
  {
    input,
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    },
    external,
    plugins
  },
  // Minified UMD build
  {
    input,
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'BinaryDOM',
      sourcemap: true,
      globals: {
        'xxhash-wasm': 'xxhashWasm'
      }
    },
    external,
    plugins: [
      ...plugins,
      terser({
        compress: {
          pure_funcs: ['console.log'],
          passes: 2
        },
        mangle: true,
        format: {
          comments: false
        }
      })
    ]
  }
]; 