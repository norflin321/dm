const { nodeExternalsPlugin } = require('esbuild-node-externals');

require('esbuild').build({
  entryPoints: [`src/jobs/${process.argv[2]}/index.ts`],
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'node',
  target: 'es2020',
  outfile: `dist/${process.argv[2]}/out.js`,
  plugins: [nodeExternalsPlugin()],
});
