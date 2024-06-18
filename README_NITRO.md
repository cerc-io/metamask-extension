# Nitro-enabled Metamask

## Build

### Checkout

Checkout the code and associated containers with:

```
# Clone
$ mkdir ~/cerc
$ cd ~/cerc
$ git clone https://git.vdb.to/cerc-io/din-payments-stack.git
$ git clone https://git.vdb.to/cerc-io/fixturenet-eth-stacks.git

# Fetch pre-built containers
$ laconic-so --stack ~/cerc/din-payments-stack/stack-orchestrator/stacks/din-payments fetch-containers --image-registry git.vdb.to/cerc-io --registry-token $GIT_VDB_TO_TKN --registry-username $GIT_VDB_TO_TKN
$ laconic-so --stack ~/cerc/fixturenet-eth-stacks/stack-orchestrator/stacks/fixturenet-eth fetch-containers --image-registry git.vdb.to/cerc-io --registry-token $GIT_VDB_TO_TKN --registry-username $GIT_VDB_TO_TKN

# Fetch all required repos
$ laconic-so --stack ~/cerc/din-payments-stack/stack-orchestrator/stacks/din-payments setup-repositories --pull

```

### Building

The `nitro-build.sh` script will build the Metamask extension and all required libraries.

```
$ cd ~/cerc/metamask-extension
$ ./nitro-build.sh
```

By default, the build script will start a "live" build of the extension with `yarn start`, which is useful for development.  Other available targets are `dist`, `prod`, and `test`.


## Testing

The Nitro tests are not run by default, they must be enabled with the `NITRO_TEST` environment variable.  The Nitro tests do not use a mocked network, they rely on *fresh* Fixturenet network being
available as well additional containers provided by the `din-payments` stack.

The setup and teardown of the entire Fixturenet stack is handled for you if you run the tests with the `./nitro-test.sh` script.


```
# First create a test build.
$ ./nitro-build.sh test

# Then run the tests.
$ ./nitro-test.sh
```
