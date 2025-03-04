import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("ArrowEditions", function () {
  // Define variables
  let simpleNFT: any;
  let deployer: any;
  let user1: any;
  let user2: any;

  // Constants for deployment
  const NFT_NAME = "My Simple NFT";
  const NFT_SYMBOL = "SNFT";
  const BASE_URI = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/";
  const MAX_SUPPLY = 1000n;

  beforeEach(async function () {
    // Get signers
    const accounts = await hre.viem.getWalletClients();
    deployer = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];

    // Deploy the contract
    const simpleNFTFactory = await hre.viem.deployContract("ArrowEditions", [
      NFT_NAME,
      NFT_SYMBOL,
      BASE_URI,
      MAX_SUPPLY,
    ]);
    simpleNFT = simpleNFTFactory;
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const name = await simpleNFT.read.name();
      const symbol = await simpleNFT.read.symbol();
      
      expect(name).to.equal(NFT_NAME);
      expect(symbol).to.equal(NFT_SYMBOL);
    });

    it("Should set the correct max supply", async function () {
      const maxSupply = await simpleNFT.read.maxSupply();
      expect(maxSupply).to.equal(MAX_SUPPLY);
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint NFTs", async function () {
      const metadataURI = "metadata/1";
      
      // Mint an NFT
      await simpleNFT.write.safeMint([user1.account.address, metadataURI], {
        account: deployer.account,
      });
      
      // Check token ownership
      const owner = await simpleNFT.read.ownerOf([0n]);
      expect(getAddress(owner)).to.equal(getAddress(user1.account.address));
      
      // Check token URI
      const uri = await simpleNFT.read.tokenURI([0n]);
      expect(uri).to.equal(BASE_URI + metadataURI);
    });

    it("Should increment token count after minting", async function () {
      // Check initial token count
      const initialCount = await simpleNFT.read.getTokenCount();
      expect(initialCount).to.equal(0n);
      
      // Mint an NFT
      await simpleNFT.write.safeMint([user1.account.address, "metadata/1"], {
        account: deployer.account,
      });
      
      // Check updated token count
      const newCount = await simpleNFT.read.getTokenCount();
      expect(newCount).to.equal(1n);
    });

    it("Should revert when non-owner tries to mint", async function () {
      // Try to mint as non-owner
      await expect(
        simpleNFT.write.safeMint([user2.account.address, "metadata/1"], {
          account: user1.account,
        })
      ).to.be.rejectedWith("OwnableUnauthorizedAccount");
    });
  });

  describe("Token URI", function () {
    it("Should return the correct token URI", async function () {
      const metadataURI = "metadata/1";
      
      // Mint an NFT
      await simpleNFT.write.safeMint([user1.account.address, metadataURI], {
        account: deployer.account,
      });
      
      // Check token URI
      const uri = await simpleNFT.read.tokenURI([0n]);
      expect(uri).to.equal(BASE_URI + metadataURI);
    });
  });
}); 