require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-truffle5");

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    goerli: {
      url: process.env.GOERLI_INFURA_KEY || "",
      accounts:
        process.env.DEV_PRIVATE_KEY !== undefined
          ? [process.env.DEV_PRIVATE_KEY]
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
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
