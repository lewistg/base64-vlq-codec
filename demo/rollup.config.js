const resolve = require('rollup-plugin-node-resolve');

export default {
    input: 'build/src/app.js',
    output: {
        file: 'bin/app-bundle.js',
        format: 'iife',
        name: 'Base64VlqCodecDemo'
    },
    plugins: [
        resolve(),
    ]
}
