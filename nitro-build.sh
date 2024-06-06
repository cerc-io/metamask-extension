#!/bin/bash

BUILD_COMMAND=${1:-start}

set -e
set -o pipefail

case "$1" in
  dist)
    BUILD_COMMAND="dist"
    ;;
  prod)
    BUILD_COMMAND="build prod"
    ;;
  test)
    BUILD_COMMAND="build:test"
    ;;
  *)
    BUILD_COMMAND="start"
    ;;
esac

cd ../ts-nitro
yarn
yarn build:browser

cd ../eth-json-rpc-nitro
yarn
yarn build

cd ../metamask-core
yarn
yarn build

cd ../metamask-extension

if [ ! -f ".metamaskrc" ]; then
  cp ".metamaskrc.dist" .metamaskrc
fi

yarn
yarn $BUILD_COMMAND --build-type flask
