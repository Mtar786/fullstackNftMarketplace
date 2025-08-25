const hre = require("hardhat");

async function main() {
  // Deploy the marketplace contract first
  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.deployed();
  console.log("NFTMarketplace deployed to:", marketplace.address);

  // Deploy the NFT contract passing the marketplace address
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(marketplace.address);
  await nft.deployed();
  console.log("NFT contract deployed to:", nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});