# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

# SimpleNFT Contract

This project contains a simple ERC-721 NFT contract implementation using OpenZeppelin's contracts library. The contract allows for minting NFTs with customizable metadata URIs.

## Features

- ERC-721 compliant NFT implementation
- Enumerable extension for easy token enumeration
- URI Storage for storing token metadata
- Owner-controlled minting
- Configurable maximum supply
- Customizable base URI for metadata

## Contract Structure

The `SimpleNFT` contract inherits from:
- `ERC721`: Base implementation of the ERC-721 standard
- `ERC721Enumerable`: Extension for enumerating owned tokens
- `ERC721URIStorage`: Extension for storing token URIs
- `Ownable`: Access control mechanism

## Getting Started

### Prerequisites

- Node.js and npm/yarn
- Hardhat

### Installation

```shell
npm install
# or
yarn
```

### Compile Contracts

```shell
npx hardhat compile
```

### Run Tests

```shell
npx hardhat test
```

### Deploy Contract

```shell
npx hardhat ignition deploy ./ignition/modules/SimpleNFT.ts
```

## Usage

### Deployment Parameters

When deploying the contract, you need to provide:
1. `name`: Name of the NFT collection
2. `symbol`: Symbol of the NFT collection
3. `baseURI`: Base URI for token metadata
4. `maxTokenSupply`: Maximum number of tokens that can be minted

### Minting NFTs

Only the contract owner can mint new NFTs:

```solidity
function safeMint(address to, string memory tokenURI) public onlyOwner returns (uint256)
```

### Setting Base URI

The contract owner can update the base URI:

```solidity
function setBaseURI(string memory baseURI) public onlyOwner
```

## License

This project is licensed under the MIT License.
