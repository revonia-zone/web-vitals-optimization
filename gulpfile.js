const rimraf = require('rimraf')
const path = require('path')
const { series } = require('gulp')
const fs = require('fs')

const outputDir = path.join(__dirname, 'docs', 'output')
function clean(cb) {
  rimraf(outputDir, () => {
    cb()
  })
}

function build(cb) {
  fs.mkdirSync(outputDir)
  fs.copyFileSync(path.join(__dirname, 'node_modules', 'web-vitals', 'dist', 'web-vitals.umd.js'), path.join(outputDir, 'web-vitals.umd.js'))
  cb()
}

exports.build = build;
exports.default = series(clean, build);

