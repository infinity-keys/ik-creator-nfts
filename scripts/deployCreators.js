const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("InfinityKeysCreators");
  const contract = await Contract.deploy(
    "InfinityKeysCreators",
    "IKC",
    "0x71665B951a9EB87c8e6A8EF29a266fA578a78654",
    "test"
  );

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
