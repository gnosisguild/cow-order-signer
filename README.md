# Cowswap Order Signer

In order to create [Roles Module](https://github.com/gnosis/zodiac-modifier-roles) permissions for Cowswap orders, we need a contract to pass in order data and sign the deterministic order id.

## How to Deploy

Clone repo, run `yarn`, run `yarn deploy {network-name}` (networks defined in `./hardhat.config.ts`)

## How to Test

In the repo, run `npx hardhat node` to fork mainnet, then in another tab run `yarn test --network localhost`
