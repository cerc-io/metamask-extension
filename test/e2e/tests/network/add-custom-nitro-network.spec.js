const { strict: assert } = require('assert');
const { toHex } = require('@metamask/controller-utils');
const FixtureBuilder = require('../../fixture-builder');
const {
  defaultGanacheOptions,
  withFixtures,
  openDapp,
  regularDelayMs,
  unlockWallet,
  WINDOW_TITLES, switchToNotificationWindow,
} = require('../../helpers');

const FIXTURENET_CHAIN_ID = toHex(1212);

const selectors = {
  accountOptionsMenuButton: '[data-testid="account-options-menu-button"]',
  informationSymbol: '[data-testid="info-tooltip"]',
  settingsOption: { text: 'Settings', tag: 'div' },
  networkOption: { text: 'Networks', tag: 'div' },
  addNetwork: { text: 'Add a network', tag: 'button' },
  addNetworkManually: { text: 'Add a network manually', tag: 'h6' },
  generalOption: { text: 'General', tag: 'div' },
  generalTabHeader: { text: 'General', tag: 'h4' },
  ethereumNetwork: { text: 'Ethereum Mainnet', tag: 'div' },
  newUpdateNetwork: { text: 'Update Network', tag: 'div' },
  deleteButton: { text: 'Delete', tag: 'button' },
  cancelButton: { text: 'Cancel', tag: 'button' },
  saveButton: { text: 'Save', tag: 'button' },
  updatedNetworkDropDown: { tag: 'span', text: 'Update Network' },
  errorMessageInvalidUrl: {
    tag: 'h6',
    text: 'URLs require the appropriate HTTP/HTTPS prefix.',
  },
  warningSymbol: {
    tag: 'h6',
    text: 'URLs require the appropriate HTTP/HTTPS prefix.',
  },
  suggestedTicker: '[data-testid="network-form-ticker-suggestion"]',
  tickerWarning: '[data-testid="network-form-ticker-warning"]',
  tickerButton: { text: 'PETH', tag: 'button' },
  networkAdded: { text: 'Network added successfully!', tag: 'h4' },
  networkNameInputField: '[data-testid="network-form-network-name"]',
  networkNameInputFieldSetToEthereumMainnet: {
    xpath:
      "//input[@data-testid = 'network-form-network-name'][@value = 'Ethereum Mainnet']",
  },
  rpcUrlInputField: '[data-testid="network-form-rpc-url"]',
  chainIdInputField: '[data-testid="network-form-chain-id"]',
  tickerInputField: '[data-testid="network-form-ticker-input"]',
  explorerInputField: '[data-testid="network-form-block-explorer-url"]',
  nitroInputField: '[data-testid="network-form-nitro-account"]',
  errorContainer: '.settings-tab__error',
  chainIdWarning: {
    tag: 'h6',
    text: 'The RPC URL you have entered returned a different chain ID',
  }
};

async function navigateToAddNetwork(driver) {
  await driver.clickElement(selectors.accountOptionsMenuButton);
  await driver.clickElement(selectors.settingsOption);
  await driver.clickElement(selectors.networkOption);
  await driver.clickElement(selectors.addNetwork);
  await driver.clickElement(selectors.addNetworkManually);
}

const fixturenetDetails = {
  networkName: 'Fixturenet Nitro',
  rpcUrl: 'http://localhost:5678/nitro/eth',
  chainId: '1212',
  ticker: 'ETH',
  nitroKey: '6177345b77c4069ac4d553f8b43cf68a799ca4bb63eac93d6cf796d63694ebf0',
};

(process.env.NITRO_TEST === "true" ? describe : describe.skip)('Custom Nitro network', function () {
  it('should add fixturenet nitro network', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withKeyringControllerAdditionalAccountVault()
          .withPreferencesControllerAdditionalAccountIdentities()
          .withAccountsControllerAdditionalAccountIdentities()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        title: this.test.fullTitle(),
      },

      async ({ driver }) => {
        await unlockWallet(driver);
        await navigateToAddNetwork(driver);
        await driver.fill(
          selectors.networkNameInputField,
          fixturenetDetails.networkName
        );
        await driver.fill(
          selectors.rpcUrlInputField,
          fixturenetDetails.rpcUrl,
        );
        await driver.fill(
          selectors.chainIdInputField,
          fixturenetDetails.chainId,
        );
        await driver.fill(
          selectors.tickerInputField,
          fixturenetDetails.ticker,
        );
        await driver.fill(
          selectors.explorerInputField,
          '');
        await driver.fill(
          selectors.nitroInputField,
          fixturenetDetails.nitroKey,
        );

        // Unknown network, so no suggested ticker is available.
        const tickerWarning = await driver.isElementPresent(
          selectors.tickerWarning,
        );
        assert.equal(
          tickerWarning,
          true,
          'Expected ticker warning missing.',
        );
        driver.clickElement(selectors.saveButton);

        // Validate the network was added
        const networkAdded = await driver.isElementPresent(
          selectors.networkAdded,
        );
        assert.equal(
          networkAdded,
          true,
          'Network not added.',
        );

        // Switch to it.
        const switchNetworkBtn = await driver.findElement({
          tag: 'h6',
          text: `Switch to ${fixturenetDetails.networkName}`,
        });

        await switchNetworkBtn.click();

        await driver.openNewPage(`http://127.0.0.1:8080`);

        const switchEthereumChainRequest = JSON.stringify({
          jsonrpc: '2.0',
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: FIXTURENET_CHAIN_ID }],
        });

        await driver.executeScript(
          `window.ethereum.request(${switchEthereumChainRequest})`,
        );

        await switchToNotificationWindow(driver, 3);
        await driver.findClickableElements({
          text: 'Switch network',
          tag: 'button',
        });
        await driver.clickElement({ text: 'Switch network', tag: 'button' });

        const windowHandles = await driver.getAllWindowHandles();
        const dapp = windowHandles[1];
        await driver.switchToWindow(dapp);

        // We have to wait for the ledger channel on chain, which takes awhile.
        await driver.driver.manage().setTimeouts({ script: 120000 });

        // This method always requires a token, so if it succeeds we know implicitly that auth was successful.
        const balanceRequest = JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [
            "0x5D81E609c15E292Bb8255bd9b1B2494DC0386062",
            "0x1"
          ]
        });

        const balance = await driver.executeScript(
          `return window.ethereum.request(${balanceRequest})`,
        );

        assert.deepStrictEqual(balance, '0x84595161401484a000000');
      },
    );
  });
});
