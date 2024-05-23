#!/bin/bash

cd ../ts-nitro && yarn && yarn build:browser
cd ../eth-json-rpc-nitro && yarn && yarn build
cd ../metamask-core && yarn && yarn build
cd ../metamask-extension

if [ ! -f ".metamaskrc" ]; then
  cp ".metamaskrc.dist" .metamaskrc
fi

yarn && yarn start --build-type flask 
