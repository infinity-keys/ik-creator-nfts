const { ethers, providers } = require("ethers");
require("dotenv").config();
const abi = require("../artifacts/contracts/IK/InfinityKeysAchievement.sol/InfinityKeysAchievement.json");

const contractAddress = "0x831684656038388D9361FfAacec6763003033eC4";

const signer = new ethers.Wallet(
  process.env.DEV_PRIVATE_KEY,
  providers.getDefaultProvider("rinkeby")
);

const contract = new ethers.Contract(contractAddress, abi.abi, signer);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const transaction = async () => {
  for (let i = 19; i < 30; i++) {
    const res = await contract.addTokenUngated(
      true,
      `https://www.infinitykeys.io/api/metadata/achievement?tokenid=${i}`
    );

    console.log(`NFT: ${i}\n${res}`);
    await sleep(1000);
  }
};

const checkStatus = async () => {
  console.log(
    await contract.editTokenURI(
      0,
      `https://www.infinitykeys.io/api/metadata/achievement?tokenid=0`
    )
  );
};

//checkStatus();
transaction();

const mintToken = async () => {
  console.log(
    await contract.airdrop(0, "0x2b7952c3f442eb8baa069f90bf692facb52890a9")
  );
};

//mintToken();
