import terser from '@rollup/plugin-terser';
import shebang from 'rollup-plugin-shebang-bin';

export default {
  input: 'compile/index.js',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
  },
  plugins: [
    terser(),
    shebang(),
  ],
};
