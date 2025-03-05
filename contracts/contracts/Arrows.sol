// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interfaces/IArrows.sol";
import "./interfaces/IArrowsEdition.sol";
import "./libraries/ArrowsArt.sol";
import "./libraries/ArrowsMetadata.sol";
import "./libraries/Utilities.sol";
import "./standards/ARROWS721.sol";

/**
@title  Arrows
@author Hurls
@notice Up and to the right.
*/
contract Arrows is IArrows, ARROWS721 {

    /// @notice The VV Arrows Edition contract.
    IArrowsEdition public editionArrows;

    /// @dev We use this database for persistent storage.
    Arrows arrows;

    /// @dev Initializes the Arrows Originals contract and links the Edition contract.
    constructor() {
        editionArrows = IArrowsEdition(0x7c5f73CE00f62e1F0364d968684b343dDAD363ac);
        arrows.day0 = uint32(block.timestamp);
    }

    /// @notice Migrate Arrows Editions to Arrows Originals by burning the Editions.
    ///         Requires the Approval of this contract on the Edition contract.
    /// @param tokenIds The Edition token IDs you want to migrate.
    /// @param recipient The address to receive the tokens.
    function mint(uint256[] calldata tokenIds, address recipient) external {
        uint256 count = tokenIds.length;

        // Burn the Editions for the given tokenIds & mint the Originals.
        for (uint256 i; i < count;) {
            uint256 id = tokenIds[i];
            address owner = editionArrows.ownerOf(id);

            // Check whether we're allowed to migrate this Edition.
            if (
                owner != msg.sender &&
                (! editionArrows.isApprovedForAll(owner, msg.sender)) &&
                editionArrows.getApproved(id) != msg.sender
            ) { revert NotAllowed(); }

            // Burn the Edition.
            editionArrows.burn(id);

            // Initialize our Arrow.
            StoredArrow storage arrow = arrows.all[id];
            arrow.day = Utilities.day(arrows.day0, block.timestamp);
            arrow.seed = uint16(id);
            arrow.divisorIndex = 0;

            // Mint the original.
            // If we're minting to a vault, transfer it there.
            if (msg.sender != recipient) {
                _safeMintVia(recipient, msg.sender, id);
            } else {
                _safeMint(msg.sender, id);
            }

            unchecked { ++i; }
        }

        // Keep track of how many arrows have been minted.
        unchecked { arrows.minted += uint32(count); }
    }

    /// @notice Get a specific check with its genome settings.
    /// @param tokenId The token ID to fetch.
    function getArrow(uint256 tokenId) external view returns (Arrow memory arrow) {
        return ArrowsArt.getArrow(tokenId, arrows);
    }


    /// @notice Composite one token into another. This mixes the visual and reduces the number of arrows.
    /// @param tokenId The token ID to keep alive. Its visual will change.
    /// @param burnId The token ID to composite into the tokenId.
    function composite(uint256 tokenId, uint256 burnId) external {

        _composite(tokenId, burnId);

        unchecked { ++arrows.burned; }
    }

    /// @notice Composite multiple tokens. This mixes the visuals and arrows in remaining tokens.
    /// @param tokenIds The token IDs to keep alive. Their art will change.
    /// @param burnIds The token IDs to composite.
    function compositeMany(uint256[] calldata tokenIds, uint256[] calldata burnIds) external {
        uint256 pairs = _multiTokenOperation(tokenIds, burnIds);

        for (uint256 i; i < pairs;) {
            _composite(tokenIds[i], burnIds[i]);

            unchecked { ++i; }
        }

        unchecked { arrows.burned += uint32(pairs); }
    }


    /// @notice Burn a arrow. Note: This burn does not composite or swap tokens.
    /// @param tokenId The token ID to burn.
    /// @dev A common purpose burn method.
    function burn(uint256 tokenId) external {
        if (! _isApprovedOrOwner(msg.sender, tokenId)) {
            revert NotAllowed();
        }

        // Perform the burn.
        _burn(tokenId);

        // Keep track of supply.
        unchecked { ++arrows.burned; }
    }

    /// @notice Simulate a composite.
    /// @param tokenId The token to render.
    /// @param burnId The token to composite.
    function simulateComposite(uint256 tokenId, uint256 burnId) public view returns (Arrow memory arrow) {
        _requireMinted(tokenId);
        _requireMinted(burnId);

        // We want to simulate for the next divisor arrow count.
        uint8 index = arrows.all[tokenId].divisorIndex;
        uint8 nextDivisor = index + 1;
        arrow = ArrowsArt.getArrow(tokenId, nextDivisor, arrows);

        // Simulate composite tree
        arrow.stored.composites[index] = uint16(burnId);

        // Simulate visual composite in stored data if we have many arrows
        if (index < 5) {
            (uint8 gradient, uint8 colorBand) = _compositeGenes(tokenId, burnId);
            arrow.stored.colorBands[index] = colorBand;
            arrow.stored.gradients[index] = gradient;
        }

        // Simulate composite in memory data
        arrow.composite = !arrow.isRoot && index < 7 ? arrow.stored.composites[index] : 0;
        arrow.colorBand = ArrowsArt.colorBandIndex(arrow, nextDivisor);
        arrow.gradient = ArrowsArt.gradientIndex(arrow, nextDivisor);
    }

    /// @notice Render the SVG for a simulated composite.
    /// @param tokenId The token to render.
    /// @param burnId The token to composite.
    function simulateCompositeSVG(uint256 tokenId, uint256 burnId) external view returns (string memory) {
        return string(ArrowsArt.generateSVG(simulateComposite(tokenId, burnId), arrows));
    }

    /// @notice Get the colors of all arrows in a given token.
    /// @param tokenId The token ID to get colors for.
    /// @dev Consider using the ArrowsArt and EightyColors Libraries
    ///      in combination with the getCheck function to resolve this yourself.
    function colors(uint256 tokenId) external view returns (string[] memory, uint256[] memory)
    {
        return ArrowsArt.colors(ArrowsArt.getArrow(tokenId, arrows), arrows);
    }

    /// @notice Render the SVG for a given token.
    /// @param tokenId The token to render.
    /// @dev Consider using the ArrowsArt Library directly.
    function svg(uint256 tokenId) external view returns (string memory) {
        return string(ArrowsArt.generateSVG(ArrowsArt.getArrow(tokenId, arrows), arrows));
    }
    
    /// @notice Get the metadata for a given token.
    /// @param tokenId The token to render.
    /// @dev Consider using the ArrowsMetadata Library directly.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        return ArrowsMetadata.tokenURI(tokenId, arrows);
    }

    /// @notice Returns how many tokens this contract manages.
    function totalSupply() public view returns (uint256) {
        return arrows.minted - arrows.burned;
    }


    /// @dev Composite one token into to another and burn it.
    /// @param tokenId The token ID to keep. Its art and arrow-count will change.
    /// @param burnId The token ID to burn in the process.
    function _composite(uint256 tokenId, uint256 burnId) internal {
        (
            StoredArrow storage toKeep,,
            uint8 divisorIndex
        ) = _tokenOperation(tokenId, burnId);

        uint8 nextDivisor = divisorIndex + 1;

        // We only need to breed band + gradient up until 4-Arrows.
        if (divisorIndex < 5) {
            (uint8 gradient, uint8 colorBand) = _compositeGenes(tokenId, burnId);

            toKeep.colorBands[divisorIndex] = colorBand;
            toKeep.gradients[divisorIndex] = gradient;
        }

        // Composite our arrow
        toKeep.day = Utilities.day(arrows.day0, block.timestamp);
        toKeep.composites[divisorIndex] = uint16(burnId);
        toKeep.divisorIndex = nextDivisor;

        // Perform the burn.
        _burn(burnId);

        // Notify DAPPs about the Composite.
        emit Composite(tokenId, burnId, ArrowsArt.DIVISORS()[toKeep.divisorIndex]);
        emit MetadataUpdate(tokenId);
    }

    /// @dev Composite the gradient and colorBand settings.
    /// @param tokenId The token ID to keep.
    /// @param burnId The token ID to burn.
    function _compositeGenes (uint256 tokenId, uint256 burnId) internal view
        returns (uint8 gradient, uint8 colorBand)
    {
        Arrow memory keeper = ArrowsArt.getArrow(tokenId, arrows);
        Arrow memory burner = ArrowsArt.getArrow(burnId, arrows);

        // Pseudorandom gene manipulation.
        uint256 randomizer = uint256(keccak256(abi.encodePacked(keeper.seed, burner.seed)));

        // If at least one token has a gradient, we force it in ~20% of cases.
        gradient = Utilities.random(randomizer, 100) > 80
            ? randomizer % 2 == 0
                ? Utilities.minGt0(keeper.gradient, burner.gradient)
                : Utilities.max(keeper.gradient, burner.gradient)
            : Utilities.min(keeper.gradient, burner.gradient);

        // We breed the lower end average color band when breeding.
        colorBand = Utilities.avg(keeper.colorBand, burner.colorBand);
    }

    /// @dev Make sure this is a valid request to composite/switch with multiple tokens.
    /// @param tokenIds The token IDs to keep.
    /// @param burnIds The token IDs to burn.
    function _multiTokenOperation(uint256[] calldata tokenIds, uint256[] calldata burnIds)
        internal pure returns (uint256 pairs)
    {
        pairs = tokenIds.length;
        if (pairs != burnIds.length) {
            revert InvalidTokenCount();
        }
    }

    /// @dev Make sure this is a valid request to composite/switch a token pair.
    /// @param tokenId The token ID to keep.
    /// @param burnId The token ID to burn.
    function _tokenOperation(uint256 tokenId, uint256 burnId)
        internal view returns (
            StoredArrow storage toKeep,
            StoredArrow storage toBurn,
            uint8 divisorIndex
        )
    {
        toKeep = arrows.all[tokenId];
        toBurn = arrows.all[burnId];
        divisorIndex = toKeep.divisorIndex;

        if (
            ! _isApprovedOrOwner(msg.sender, tokenId) ||
            ! _isApprovedOrOwner(msg.sender, burnId) ||
            divisorIndex != toBurn.divisorIndex ||
            tokenId == burnId ||
            divisorIndex > 5
        ) {
            revert NotAllowed();
        }
    }

    /// @notice Check if a token has a single green arrow with color #018A08
    /// @param tokenId The token ID to check
    /// @return bool True if the token has exactly one arrow with color #018A08
    function isWinner(uint256 tokenId) external view returns (bool) {
        _requireMinted(tokenId);
        
        // Get the arrow data
        Arrow memory arrow = ArrowsArt.getArrow(tokenId, arrows);
        
        // Check if it has exactly one arrow
        if (arrow.arrowsCount != 1) {
            return false;
        }
        
        // Get the colors
        (string[] memory tokenColors,) = ArrowsArt.colors(arrow, arrows);
        
        // Check if the single color matches our target green
        return keccak256(abi.encodePacked(tokenColors[0])) == keccak256(abi.encodePacked("018A08"));
    }
}
