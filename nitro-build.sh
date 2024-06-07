#!/bin/bash

BUILD_COMMAND=${1:-start}

set -e
set -o pipefail

# Since we are building some of the dependencies locally, it will fail with immutable installs enabled.
export YARN_ENABLE_IMMUTABLE_INSTALLS=false

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
  if [ ! -z "$INFURA_PROJECT_ID" ]; then
    sed -i "s/INFURA_PROJECT_ID=.*/INFURA_PROJECT_ID=$INFURA_PROJECT_ID/" .metamaskrc
  fi
fi

yarn
yarn $BUILD_COMMAND --build-type flask
