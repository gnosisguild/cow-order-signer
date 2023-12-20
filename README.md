# Cowswap Order Signer

In order to create [Roles Module](https://github.com/gnosis/zodiac-modifier-roles) permissions for Cowswap orders, we need a contract to pass in order data and sign the deterministic order id.

## Audits

- [Omniscia](https://omniscia.io/reports/gnosis-guild-cow-order-signer-654ca7b04ca7a30019c86b95/)
- [G0 Group](https://github.com/g0-group/Audits/blob/master/CowswapOrderSignerDec2023.pdf)

## Deployments

Address: `0x23dA9AdE38E4477b23770DeD512fD37b12381FAB`

- [Ethereum](https://etherscan.io/address/0x23dA9AdE38E4477b23770DeD512fD37b12381FAB)
- [Gnosis](https://gnosisscan.io/address/0x23dA9AdE38E4477b23770DeD512fD37b12381FAB)
- [Goerli](https://goerli.etherscan.io/address/0x23dA9AdE38E4477b23770DeD512fD37b12381FAB)

## How to Deploy

Clone repo, run `yarn`, run `yarn deploy {network-name}` (networks defined in `./hardhat.config.ts`)

## How to Test

In the repo, run `npx hardhat node` to fork mainnet, then in another tab run `yarn test --network localhost`
