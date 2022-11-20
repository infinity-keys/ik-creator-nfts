const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("InfinityKeysAchievement");
  const contract = await Contract.deploy("InfinityKeysAchievement", "IKA", "0x247fEfEF45134228093Ac6ce41Ee615D327b957E", "magic", "0x93f54D755A063cE7bB9e6Ac47Eccc8e33411d706");

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
