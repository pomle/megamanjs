#! /usr/bin/env bash
set -e

TOOLS_DIR=$(dirname $0)
SRC_DIR="$(dirname $0)/../src"
BUILD_DIR="$(dirname $0)/../build"

mkdir -p $BUILD_DIR

cp "${SRC_DIR}/main.css" "${BUILD_DIR}/main.css"
cp "${SRC_DIR}/main.js" "${BUILD_DIR}/main.js"

cp -r "${SRC_DIR}/resource" "${BUILD_DIR}/"

$TOOLS_DIR/generate-prod-html.js > "${BUILD_DIR}/index.html"
$TOOLS_DIR/concat-js.js > "${BUILD_DIR}/megaman.js"

echo "Build OK"
