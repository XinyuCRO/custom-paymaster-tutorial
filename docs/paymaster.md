# Paymater on the Cronos zkEVM testnet

- [USDC on Sepolia(L1)](https://sepolia.etherscan.io/address/0x768494eEE366D14d0d1D33a11023175DB80FB9A2)
  - it's a free mint token for testing purposes
- [USDC on Cronos zkEVM testnet(L2)](https://zkevm-t0.cronos.org/explorer/address/0x7AD233FC8BC8Eb25b6CE7c0055b3e4226c3320d5)
- [A sample Paymaster on Cronos zkEVM testnet(L2)](https://zkevm-t0.cronos.org/explorer/address/0xB0Ee864E9859a785F34B9341eB5979699a117Ee0)
  - Can be used to sponsor general transaction on L2, [an example TX](https://zkevm-t0.cronos.org/explorer/tx/0x1c12b30f8bfe0cc877e203ec9a5b7968827c4daa82e102a4a0304f1abbfc4416)



## How to use

### Deploy Paymaster

[deploy-paymaster.ts](../deploy/00-deploy-paymaster.ts)

Use this script to deploy a paymaster contract on Cronos zkEVM testnet, or you can use the [pre-deployed one](https://zkevm-t0.cronos.org/explorer/address/0xB0Ee864E9859a785F34B9341eB5979699a117Ee0)

```bash
npm run 00-deploy-paymaster
```

### Fund Paymaster & Wallet

[01-fund-paymaster.ts](../deploy/01-fund-paymaster-and-wallet.ts)

Use this script to fund the paymaster contract and wallet, you can use the pre-deployed paymaster contract address `0xB0Ee864E9859a785F34B9341eB5979699a117Ee0` and the wallet private key `0xa74423276b714949c8af927a925bc34c9cd45141365610767203df68af7c8f99` to test.

```bash
npm run 01-fund-paymaster-and-wallet
```

### Sponsor Transaction with Paymaster

[02-use-erc20-paymaster](../deploy/02-use-erc20-paymaster.ts)

Use this script to sponsor a transaction with paymaster

```bash
npm run 02-use-erc20-paymaster
```

### Deploy Oracle Contract

[03-deploy-oracle.ts](../deploy/03-deploy-oracle.ts)

Use this script to deploy an oracle contract on Cronos zkEVM testnet

### Update Oracle Price

[04-update-oracle.ts](../deploy/04-update-oracle.ts)

Use this script to update the oracle price to CRO/USD pair


```bash

## `.env`

an example `.env` file, fill in the `WALLET_PRIVATE_KEY`, this account need to have some CRO and USDC tokens on L2 in order to fund the paymaster contract & empty wallet.

```
WALLET_PRIVATE_KEY=

EMPTY_WALLET_PRIVATE_KEY=0xa74423276b714949c8af927a925bc34c9cd45141365610767203df68af7c8f99
PAYMASTER_ADDRESS=0xB0Ee864E9859a785F34B9341eB5979699a117Ee0
ERC20_TOKEN_ADDRESS=0x7AD233FC8BC8Eb25b6CE7c0055b3e4226c3320d5
```
