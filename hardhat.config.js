require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-truffle5");

module.exports = {
  solidity: {
    version: "0.8.5",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_INFURA_KEY || "",
      accounts:
        process.env.DEV_PRIVATE_KEY !== undefined
          ? [process.env.DEV_PRIVATE_KEY]
          : [],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts:
        process.env.IK_PRIVATE_KEY !== undefined
          ? [process.env.IK_PRIVATE_KEY]
          : [],
      gas: 5000000,
      gasPrice: 75000000000,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43113,
      accounts:
        process.env.DEV_PRIVATE_KEY !== undefined
          ? [process.env.DEV_PRIVATE_KEY]
          : [],
    },
    avaxMainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43114,
      accounts:
        process.env.IK_PRIVATE_KEY !== undefined
          ? [process.env.IK_PRIVATE_KEY]
          : [],
    },
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      gasPrice: 8000000000,
      chainId: 80001,
      accounts:
        process.env.DEV_PRIVATE_KEY !== undefined
          ? [process.env.DEV_PRIVATE_KEY]
          : [],
    },
    maticMainnet: {
      url: "https://polygon-rpc.com/",
      gas: 2100000,
      gasPrice: 80000000000,
      accounts:
        process.env.IK_PRIVATE_KEY !== undefined
          ? [process.env.IK_PRIVATE_KEY]
          : [],
    },
    optigoerli: {
      url: "https://optimism-goerli.infura.io/v3/c10d222a5bae4a8e97fad0915b06ff5d",
      accounts:
        process.env.DEV_PRIVATE_KEY !== undefined
          ? [process.env.DEV_PRIVATE_KEY]
          : [],
    },
    optimism: {
      url: "https://optimism-mainnet.infura.io/v3/c10d222a5bae4a8e97fad0915b06ff5d",
      accounts:
        process.env.IK_PRIVATE_KEY !== undefined
          ? [process.env.IK_PRIVATE_KEY]
          : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
