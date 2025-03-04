// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArrowEditions
 * @dev A simple ERC721 NFT contract with shared metadata for all tokens
 */
contract ArrowEditions is ERC721, ERC721Enumerable, Ownable {
    // Token ID counter
    uint256 private _nextTokenId;
    
    // Maximum supply of NFTs
    uint256 public immutable maxSupply;
    
    // Shared metadata URI for all tokens
    string private _sharedMetadataURI;
    
    // Price per mint in ETH (0.02 ETH)
    uint256 public constant MINT_PRICE = 0.02 ether;

    /**
     * @dev Constructor initializes the NFT collection
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     * @param metadataURI Shared metadata URI for all tokens
     * @param maxTokenSupply Maximum number of tokens that can be minted
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory metadataURI,
        uint256 maxTokenSupply
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _sharedMetadataURI = metadataURI;
        maxSupply = maxTokenSupply;
    }

    /**
     * @dev Mint a new NFT to the specified address
     * @param to Address to mint the NFT to
     * @return tokenId The ID of the newly minted token
     */
    function safeMint(address to) public payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        uint256 tokenId = _nextTokenId;
        require(tokenId < maxSupply, "Max supply reached");
        
        _nextTokenId++;
        _safeMint(to, tokenId);
        
        return tokenId;
    }

    /**
     * @dev Batch mint multiple NFTs to the specified address
     * @param to Address to mint the NFTs to
     * @param amount Number of NFTs to mint
     * @return startTokenId The ID of the first minted token
     */
    function batchMint(address to, uint256 amount) public payable returns (uint256) {
        require(msg.value >= MINT_PRICE * amount, "Insufficient payment");
        uint256 startTokenId = _nextTokenId;
        require(startTokenId + amount <= maxSupply, "Would exceed max supply");
        
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(to, _nextTokenId);
            _nextTokenId++;
        }
        
        return startTokenId;
    }
    
    /**
     * @dev Mint a new NFT to the specified address (owner only, no payment required)
     * @param to Address to mint the NFT to
     * @return tokenId The ID of the newly minted token
     */
    function ownerMint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        require(tokenId < maxSupply, "Max supply reached");
        
        _nextTokenId++;
        _safeMint(to, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple NFTs to the specified address (owner only, no payment required)
     * @param to Address to mint the NFTs to
     * @param amount Number of NFTs to mint
     * @return startTokenId The ID of the first minted token
     */
    function ownerBatchMint(address to, uint256 amount) public onlyOwner returns (uint256) {
        uint256 startTokenId = _nextTokenId;
        require(startTokenId + amount <= maxSupply, "Would exceed max supply");
        
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(to, _nextTokenId);
            _nextTokenId++;
        }
        
        return startTokenId;
    }
    
    /**
     * @dev Withdraw all funds from the contract to the owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Set the shared metadata URI for all tokens
     * @param metadataURI New shared metadata URI
     */
    function setSharedMetadataURI(string memory metadataURI) public onlyOwner {
        _sharedMetadataURI = metadataURI;
    }

    /**
     * @dev Get the token URI for a given token ID
     * @param tokenId Token ID to get the URI for
     * @return The token's URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _sharedMetadataURI;
    }

    /**
     * @dev Get the current token count
     * @return Current token count
     */
    function getTokenCount() public view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Burns a specific token
     * @param tokenId Token ID to burn
     * @notice Only the owner of the token or an approved address can burn it
     */
    function burn(uint256 tokenId) public {
        // Check that the caller is either the token owner or approved to manage the token
        address owner = ownerOf(tokenId);
        require(
            _isAuthorized(owner, msg.sender, tokenId),
            "Caller is not token owner or approved"
        );
        
        // Burn the token
        _burn(tokenId);
    }

    // The following functions are overrides required by Solidity

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 