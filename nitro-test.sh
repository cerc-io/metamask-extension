#!/usr/bin/env bash

DEPLOYMENT_DIR=`pwd`/deployment

export NITRO_AUTH_STACK=~/cerc/din-payments-stack/stack-orchestrator/stacks/din-payments
export FXETH_STACK=~/cerc/fixturenet-eth-stacks/stack-orchestrator/stacks/fixturenet-eth

if [ ! -d "$DEPLOYMENT_DIR" ]; then
  mkdir -p "$DEPLOYMENT_DIR"
fi


function fxnet_down() {
  echo "Cleaning old deployments..."
  laconic-so deployment --dir $DEPLOYMENT_DIR/nitro-net down --delete-volumes
  laconic-so deployment --dir $DEPLOYMENT_DIR/nitro-auth down --delete-volumes
  sudo rm -rf $DEPLOYMENT_DIR/nitro-*
}


function fxnet_up() {
  echo "Creating new deployments..."
  laconic-so --stack $FXETH_STACK deploy init --output nitro-net.yml
  laconic-so --stack $FXETH_STACK deploy create --spec-file nitro-net.yml --deployment-dir $DEPLOYMENT_DIR/nitro-net
  
  laconic-so --stack $NITRO_AUTH_STACK deploy init --map-ports-to-host any-same --output nitro-auth.yml
  laconic-so --stack $NITRO_AUTH_STACK deploy create --spec-file nitro-auth.yml --deployment-dir $DEPLOYMENT_DIR/nitro-auth
  
  cp $DEPLOYMENT_DIR/nitro-net/deployment.yml $DEPLOYMENT_DIR/nitro-auth/deployment.yml
  laconic-so deployment --dir $DEPLOYMENT_DIR/nitro-net up
  laconic-so deployment --dir $DEPLOYMENT_DIR/nitro-auth up
}

function fxnet_wait_till_ready() {
  printf "Waiting for fixturenet to be ready"
  until curl --output /dev/null --silent --fail http://localhost:5678/nitro/metrics; do
      printf '.'
      sleep 5
  done
  echo "READY"
}

fxnet_down
fxnet_up
fxnet_wait_till_ready

NITRO_TEST=true yarn test:e2e:single test/e2e/tests/network/add-custom-nitro-network.spec.js --browser chrome
rc=$?

fxnet_down

if [ $rc -eq 0 ]; then
  echo "TEST PASSED"
else
  echo "TEST FAILED"
fi

exit $rc
