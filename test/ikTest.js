const { expect } = require("chai");
const { ethers } = require("hardhat");

let owner, addr1, addr2, contract;
describe("Combined", async function () {
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("InfinityKeysAchievement");
    contract = await Contract.deploy(
      "InfinityKeysAchievement",
      "IKA",
      "0x805C428E46894fd077E9Cdd9D403fdF3ebDCDd4E",
      "wagmi",
      "0x805C428E46894fd077E9Cdd9D403fdF3ebDCDd4E"
    );

    await contract.addTokenUngated(true, "uri0");
    await contract.addTokenUngated(true, "uri1");
  });

  it("should make 1 new tokens", async () => {
    console.log(await contract.tokens(0));
    console.log(await contract.getToken(0));
    expect(await contract.tokens(0)).to.equal(false);
  });
  it("should make 1 new tokens", async () => {
    await contract.addToken(true, 0, 0, ethers.constants.AddressZero, "uri2");
    expect(await contract.exists(0)).to.equal(true);
    expect(await contract.exists(1)).to.equal(true);
    expect(await contract.exists(2)).to.equal(true);
    expect(await contract.exists(3)).to.equal(false);
  });

  it("should edit token", async () => {
    expect(await contract.isSaleOpen(1)).to.equal(true);
    expect(await contract.uri(1)).to.equal("uri1");
    await contract.editToken(
      false,
      0,
      0,
      ethers.constants.AddressZero,
      "bleh",
      1
    );
    expect(await contract.isSaleOpen(1)).to.equal(false);
    expect(await contract.uri(1)).to.equal("bleh");
  });

  it("should airdrop token", async () => {
    await contract.airdrop(0, addr1.address);
    expect(await contract.totalSupply(1)).to.equal(0);
    await contract.airdrop(1, addr2.address);
    expect(await contract.totalSupply(0)).to.equal(1);
    expect(await contract.totalSupply(1)).to.equal(1);
  });

  it("should claim token", async () => {
    await contract.connect(addr1).claim(0, "0x69");
    expect(await contract.totalSupply(0)).to.equal(1);
    expect((await contract.balanceOf(addr1.address, 0)).toNumber()).to.equal(1);
    await contract.addToken(true, 0, 0, ethers.constants.AddressZero, "uri2");
    expect((await contract.balanceOf(addr1.address, 2)).toNumber()).to.equal(0);
    await contract.connect(addr1).claim(2, "0x69");
    expect(await contract.totalSupply(2)).to.equal(1);
    expect((await contract.balanceOf(addr1.address, 2)).toNumber()).to.equal(1);
  });

  //testing reverts
  it("should revert edit", async () => {
    await expect(
      contract.editToken(false, 0, 0, ethers.constants.AddressZero, "bleh", 4)
    ).to.be.revertedWith("EditToken: Token ID does not exist");
  });

  it("should revert claims", async () => {
    await expect(
      contract.claim(
        4,
        "0x69d56943e896d58996d91408cd7dc848c8d66c0331ea25ade2ba30f44334abb33f50dce362820edcc40ff4cfcb2b8e4cc63e33d3299bf2c95eff831ff9f6764d1c"
      )
    ).to.be.revertedWith("Claim: token does not exist");
    await contract.editToken(
      false,
      0,
      0,
      ethers.constants.AddressZero,
      "bleh",
      0
    );
    await expect(
      contract.claim(
        0,
        "0x69d56943e896d58996d91408cd7dc848c8d66c0331ea25ade2ba30f44334abb33f50dce362820edcc40ff4cfcb2b8e4cc63e33d3299bf2c95eff831ff9f6764d1c"
      )
    ).to.be.revertedWith("Claim: sale is closed");
    await contract.editToken(
      true,
      0,
      0,
      ethers.constants.AddressZero,
      "bleh",
      0
    );
    await contract.claim(
      0,
      "0x69d56943e896d58996d91408cd7dc848c8d66c0331ea25ade2ba30f44334abb33f50dce362820edcc40ff4cfcb2b8e4cc63e33d3299bf2c95eff831ff9f6764d1c"
    );
    await expect(
      contract.claim(
        0,
        "0x69d56943e896d58996d91408cd7dc848c8d66c0331ea25ade2ba30f44334abb33f50dce362820edcc40ff4cfcb2b8e4cc63e33d3299bf2c95eff831ff9f6764d1c"
      )
    ).to.be.revertedWith("Claim: NFT already claimed by address");
    await contract.editToken(
      true,
      1,
      1,
      ethers.constants.AddressZero,
      "bleh",
      0
    );
    await expect(
      contract
        .connect(addr1)
        .claim(
          0,
          "0x69d56943e896d58996d91408cd7dc848c8d66c0331ea25ade2ba30f44334abb33f50dce362820edcc40ff4cfcb2b8e4cc63e33d3299bf2c95eff831ff9f6764d1c"
        )
    ).to.be.revertedWith("Claim: Address does not own requisite NFT");
    //await contract.editToken(true, true, 0, '0x0e6F2c02080dE8A5D5A5Ff28262067c49af0B228', "bleh", 0);
    //await expect(contract.connect(addr1).claim(0, '0x69d56943e896d58996d91408cd7dc848c8d66c0331ea25ade2ba30f44334abb33f50dce362820edcc40ff4cfcb2b8e4cc63e33d3299bf2c95eff831ff9f6764d1c')).to.be.revertedWith('Claim: Must own gated NFT to claim')
  });
});
