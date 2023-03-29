import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "hardhat-deploy";

import dotenv from "dotenv";
import { HardhatUserConfig, HttpNetworkUserConfig } from "hardhat/types";

dotenv.config();
const { INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY } = process.env;
const DEFAULT_MNEMONIC =
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const sharedNetworkConfig: HttpNetworkUserConfig = {};

sharedNetworkConfig.accounts = {
  mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
};

export default {
  solidity: {
    compilers: [
      {
        version: "0.8.12",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        blockNumber: 16883800,
      },
    },
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
    sepolia: {
      ...sharedNetworkConfig,
      url: `https://sepolia.infura.io/v3/${INFURA_KEY}`,
    },
    xdai: {
      ...sharedNetworkConfig,
      url: "https://rpc.gnosischain.com/",
    },
    matic: {
      ...sharedNetworkConfig,
      url: "https://rpc-mainnet.maticvigil.com",
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
  },
} satisfies HardhatUserConfig;
