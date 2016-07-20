#! /usr/bin/env bash
set -e

TOOLS_DIR=$(dirname $0)
BUILD_DIR="$(dirname $0)/../build"

$TOOLS_DIR/minify.js "${BUILD_DIR}/megaman.js" "${BUILD_DIR}/main.js" > "${BUILD_DIR}/megaman.min.js"
$TOOLS_DIR/generate-minify-html.js > "${BUILD_DIR}/index.html"

rm "${BUILD_DIR}/megaman.js" "${BUILD_DIR}/main.js"

echo "Minification OK"
