const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("InfinityKeysAchievement");
  const contract = await Contract.deploy("InfinityKeysAchievement", "IKA", "0x247fEfEF45134228093Ac6ce41Ee615D327b957E", "magic", "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675");

    await contract.deployed();

    console.log("Contract deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
