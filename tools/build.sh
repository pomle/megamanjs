#!/usr/bin/env bash

TOOLS_DIR=$(dirname $0)
SRC_DIR="$(dirname $0)/../src"
BUILD_DIR="$(dirname $0)/../build"

mkdir -p $BUILD_DIR

cp "${SRC_DIR}/prod.html" "${BUILD_DIR}/index.html"
cp "${SRC_DIR}/prod.css" "${BUILD_DIR}/megaman.css"
cp "${SRC_DIR}/prod.js" "${BUILD_DIR}/main.js"

cp -r "${SRC_DIR}/game/resource" "${BUILD_DIR}/"

node "${TOOLS_DIR}/concat-js.js" | cat > "${BUILD_DIR}/megaman.js"
