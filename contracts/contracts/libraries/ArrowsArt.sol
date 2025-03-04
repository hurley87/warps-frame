//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/IChecks.sol";
import "./EightyColors.sol";
import "./Utilities.sol";

/**

 /////////   ARROWS   /////////
 //                             //
 //                             //
 //                             //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //       ↗ ↗ ↗ ↗ ↗ ↗ ↗ ↗       //
 //                             //
 //                             //
 //                             //
 /////   POINT UP & RIGHT   /////

@title  ArrowsArt
@author VisualizeValue
@notice Renders the Arrows visuals.
*/
library ArrowsArt {

    /// @dev The path for a 20x20 px arrow pointing up and to the right, based on a 36x36 px frame.
    string public constant ARROWS_PATH = 'M5.151 19.707c2.304-5.292.659-7.943 3.636-10.92C11.764 5.81 15.5 6.5 19.707 5.15 24.5 2.5 25.79 0 30 0c4.21 0 5.5 3 10.293 5.151 3.707 1.664 7.943.659 10.92 3.635C54.19 11.764 53 14.5 54.849 19.707 56.196 23.5 60 25.79 60 30c0 4.21-3.5 7-5.151 10.293-1.651 3.292-.659 7.943-3.636 10.92C48.236 54.19 45 53 40.293 54.849 36.5 56.339 34.21 60 30 60c-4.21 0-6.5-3-10.293-5.151-3.792-2.151-7.943-.659-10.92-3.636C5.81 48.236 6.5 44.5 5.151 40.293 3.802 36.085 0 34.21 0 30c0-4.21 2.847-5 5.151-10.293Z';
    
    /// @dev The unicode arrow character pointing up and to the right (↗)
    string public constant ARROW_SYMBOL = unicode"↗";

    /// @dev The semiperfect divisors of the 80 checks.
    function DIVISORS() public pure returns (uint8[8] memory) {
        return [ 80, 40, 20, 10, 5, 4, 1, 0 ];
    }

    /// @dev The different color band sizes that we use for the art.
    function COLOR_BANDS() public pure returns (uint8[7] memory) {
        return [ 80, 60, 40, 20, 10, 5, 1 ];
    }

    /// @dev The gradient increment steps.
    function GRADIENTS() public pure returns (uint8[7] memory) {
        return [ 0, 1, 2, 5, 8, 9, 10 ];
    }

    /// @dev Load a check from storage and fill its current state settings.
    /// @param tokenId The id of the check to fetch.
    /// @param checks The DB containing all checks.
    function getCheck(
        uint256 tokenId, IChecks.Checks storage checks
    ) public view returns (IChecks.Check memory check) {
        IChecks.StoredCheck memory stored = checks.all[tokenId];

        return getCheck(tokenId, stored.divisorIndex, checks);
    }

    /// @dev Load a check from storage and fill its current state settings.
    /// @param tokenId The id of the check to fetch.
    /// @param divisorIndex The divisorindex to get.
    /// @param checks The DB containing all checks.
    function getCheck(
        uint256 tokenId, uint8 divisorIndex, IChecks.Checks storage checks
    ) public view returns (IChecks.Check memory check) {
        IChecks.StoredCheck memory stored = checks.all[tokenId];
        stored.divisorIndex = divisorIndex; // Override in case we're fetching specific state.
        check.stored = stored;

        // Set up the source of randomness + seed for this Check.
        uint128 randomness = checks.epochs[stored.epoch].randomness;
        check.seed = (uint256(keccak256(abi.encodePacked(randomness, stored.seed))) % type(uint128).max);

        // Helpers
        check.isRoot = divisorIndex == 0;
        check.isRevealed = randomness > 0;
        check.hasManyChecks = divisorIndex < 6;
        check.composite = !check.isRoot && divisorIndex < 7 ? stored.composites[divisorIndex - 1] : 0;

        // Token properties
        check.colorBand = colorBandIndex(check, divisorIndex);
        check.gradient = gradientIndex(check, divisorIndex);
        check.checksCount = DIVISORS()[divisorIndex];
        check.speed = uint8(2**(check.seed % 3));
        check.direction = uint8(check.seed % 2);
    }

    /// @dev Query the gradient of a given check at a certain check count.
    /// @param check The check we want to get the gradient for.
    /// @param divisorIndex The check divisor in question.
    function gradientIndex(IChecks.Check memory check, uint8 divisorIndex) public pure returns (uint8) {
        uint256 n = Utilities.random(check.seed, 'gradient', 100);

        return divisorIndex == 0
            ? n < 20 ? uint8(1 + (n % 6)) : 0
            : divisorIndex < 6
                ? check.stored.gradients[divisorIndex - 1]
                : 0;
    }

    /// @dev Query the color band of a given check at a certain check count.
    /// @param check The check we want to get the color band for.
    /// @param divisorIndex The check divisor in question.
    function colorBandIndex(IChecks.Check memory check, uint8 divisorIndex) public pure returns (uint8) {
        uint256 n = Utilities.random(check.seed, 'band', 120);

        return divisorIndex == 0
            ?   ( n > 80 ? 0
                : n > 40 ? 1
                : n > 20 ? 2
                : n > 10 ? 3
                : n >  4 ? 4
                : n >  1 ? 5
                : 6 )
            : divisorIndex < 6
                ? check.stored.colorBands[divisorIndex - 1]
                : 6;
    }

    /// @dev Generate indexes for the color slots of check parents (up to the EightyColors.COLORS themselves).
    /// @param divisorIndex The current divisorIndex to query.
    /// @param check The current check to investigate.
    /// @param checks The DB containing all checks.
    function colorIndexes(
        uint8 divisorIndex, IChecks.Check memory check, IChecks.Checks storage checks
    )
        public view returns (uint256[] memory)
    {
        uint8[8] memory divisors = DIVISORS();
        uint256 checksCount = divisors[divisorIndex];
        uint256 seed = check.seed;
        uint8 colorBand = COLOR_BANDS()[colorBandIndex(check, divisorIndex)];
        uint8 gradient = GRADIENTS()[gradientIndex(check, divisorIndex)];

        // If we're a composited check, we choose colors only based on
        // the slots available in our parents. Otherwise,
        // we choose based on our available spectrum.
        uint256 possibleColorChoices = divisorIndex > 0
            ? divisors[divisorIndex - 1] * 2
            : 80;

        // We initialize our index and select the first color
        uint256[] memory indexes = new uint256[](checksCount);
        indexes[0] = Utilities.random(seed, possibleColorChoices);

        // If we have more than one check, continue selecting colors
        if (check.hasManyChecks) {
            if (gradient > 0) {
                // If we're a gradient check, we select based on the color band looping around
                // the 80 possible colors
                for (uint256 i = 1; i < checksCount;) {
                    indexes[i] = (indexes[0] + (i * gradient * colorBand / checksCount) % colorBand) % 80;
                    unchecked { ++i; }
                }
            } else if (divisorIndex == 0) {
                // If we select initial non gradient colors, we just take random ones
                // available in our color band
                for (uint256 i = 1; i < checksCount;) {
                    indexes[i] = (indexes[0] + Utilities.random(seed + i, colorBand)) % 80;
                    unchecked { ++i; }
                }
            } else {
                // If we have parent checks, we select our colors from their set
                for (uint256 i = 1; i < checksCount;) {
                    indexes[i] = Utilities.random(seed + i, possibleColorChoices);
                    unchecked { ++i; }
                }
            }
        }

        // We resolve our color indexes through our parent tree until we reach the root checks
        if (divisorIndex > 0) {
            uint8 previousDivisor = divisorIndex - 1;

            // We already have our current check, but need the our parent state color indices
            uint256[] memory parentIndexes = colorIndexes(previousDivisor, check, checks);

            // We also need to fetch the colors of the check that was composited into us
            IChecks.Check memory composited = getCheck(check.composite, checks);
            uint256[] memory compositedIndexes = colorIndexes(previousDivisor, composited, checks);

            // Replace random indices with parent / root color indices
            uint8 count = divisors[previousDivisor];

            // We always select the first color from our parent
            uint256 initialBranchIndex = indexes[0] % count;
            indexes[0] = indexes[0] < count
                ? parentIndexes[initialBranchIndex]
                : compositedIndexes[initialBranchIndex];

            // If we don't have a gradient, we continue resolving from our parent for the remaining checks
            if (gradient == 0) {
                for (uint256 i; i < checksCount;) {
                    uint256 branchIndex = indexes[i] % count;
                    indexes[i] = indexes[i] < count
                        ? parentIndexes[branchIndex]
                        : compositedIndexes[branchIndex];

                    unchecked { ++i; }
                }
            // If we have a gradient we base the remaining colors off our initial selection
            } else {
                for (uint256 i = 1; i < checksCount;) {
                    indexes[i] = (indexes[0] + (i * gradient * colorBand / checksCount) % colorBand) % 80;

                    unchecked { ++i; }
                }
            }
        }

        return indexes;
    }

    /// @dev Fetch all colors of a given Check.
    /// @param check The check to get colors for.
    /// @param checks The DB containing all checks.
    function colors(
        IChecks.Check memory check, IChecks.Checks storage checks
    ) public view returns (string[] memory, uint256[] memory) {
        // A fully composited check has no color.
        if (check.stored.divisorIndex == 7) {
            string[] memory zeroColors = new string[](1);
            uint256[] memory zeroIndexes = new uint256[](1);
            zeroColors[0] = '000';
            zeroIndexes[0] = 999;
            return (zeroColors, zeroIndexes);
        }

        // An unrevealed check is all gray.
        if (! check.isRevealed) {
            string[] memory preRevealColors = new string[](1);
            uint256[] memory preRevealIndexes = new uint256[](1);
            preRevealColors[0] = '424242';
            preRevealIndexes[0] = 0;
            return (preRevealColors, preRevealIndexes);
        }

        // Fetch the indices on the original color mapping.
        uint256[] memory indexes = colorIndexes(check.stored.divisorIndex, check, checks);

        // Map over to get the colors.
        string[] memory checkColors = new string[](indexes.length);
        string[80] memory allColors = EightyColors.COLORS();

        // Always set the first color.
        checkColors[0] = allColors[indexes[0]];

        // Resolve each additional check color via their index in EightyColors.COLORS.
        for (uint256 i = 1; i < indexes.length; i++) {
            checkColors[i] = allColors[indexes[i]];
        }

        return (checkColors, indexes);
    }

    /// @dev Get the number of checks we should display per row.
    /// @param checks The number of checks in the piece.
    function perRow(uint8 checks) public pure returns (uint8) {
        return checks == 80
            ? 8
            : checks >= 20
                ? 4
                : checks == 10 || checks == 4
                    ? 2
                    : 1;
    }

    /// @dev Get the X-offset for positioning checks horizontally.
    /// @param checks The number of checks in the piece.
    function rowX(uint8 checks) public pure returns (uint16) {
        return checks <= 1
            ? 286
            : checks == 5
                ? 304
                : checks == 10 || checks == 4
                    ? 268
                    : 196;
    }

    /// @dev Get the Y-offset for positioning checks vertically.
    /// @param checks The number of checks in the piece.
    function rowY(uint8 checks) public pure returns (uint16) {
        return checks > 4
            ? 160
            : checks == 4
                ? 268
                : checks > 1
                    ? 304
                    : 286;
    }

    /// @dev Get the animation SVG snipped for an individual check of a piece.
    /// @param data The data object containing rendering settings.
    /// @param offset The index position of the check in question.
    /// @param allColors All available colors.
    function fillAnimation(
        CheckRenderData memory data,
        uint256 offset,
        string[80] memory allColors
    ) public pure returns (bytes memory)
    {
        // We only pick 20 colors from our gradient to reduce execution time.
        uint8 count = 20;

        bytes memory values;

        // Reverse loop through our color gradient.
        if (data.check.direction == 0) {
            for (uint256 i = offset + 80; i > offset;) {
                values = abi.encodePacked(values, '#', allColors[i % 80], ';');
                unchecked { i-=4; }
            }
        // Forward loop through our color gradient.
        } else {
            for (uint256 i = offset; i < offset + 80;) {
                values = abi.encodePacked(values, '#', allColors[i % 80], ';');
                unchecked { i+=4; }
            }
        }

        // Add initial color as last one for smooth animations.
        values = abi.encodePacked(values, '#', allColors[offset]);

        // Render the SVG snipped for the animation
        return abi.encodePacked(
            '<animate ',
                'attributeName="fill" values="',values,'" ',
                'dur="',Utilities.uint2str(count * 2 / data.check.speed),'s" begin="animation.begin" ',
                'repeatCount="indefinite" ',
            '/>'
        );
    }

    /// @dev Generate the SVG code for all checks in a given token.
    /// @param data The data object containing rendering settings.
    function generateChecks(CheckRenderData memory data) public pure returns (bytes memory) {
        bytes memory checksBytes;
        string[80] memory allColors = EightyColors.COLORS();

        uint8 checksCount = data.count;
        for (uint8 i; i < checksCount; i++) {
            // Compute row settings.
            data.indexInRow = i % data.perRow;
            data.isNewRow = data.indexInRow == 0 && i > 0;

            // Compute offsets.
            if (data.isNewRow) data.rowY += data.spaceY;
            if (data.isNewRow && data.indent) {
                if (i == 0) {
                    data.rowX += data.spaceX / 2;
                }

                if (i % (data.perRow * 2) == 0) {
                    data.rowX -= data.spaceX / 2;
                } else {
                    data.rowX += data.spaceX / 2;
                }
            }
            string memory translateX = Utilities.uint2str(data.rowX + data.indexInRow * data.spaceX);
            string memory translateY = Utilities.uint2str(data.rowY);
            string memory color = data.check.isRevealed ? data.colors[i] : data.colors[0];
            
            // Get animation bytes if needed
            bytes memory animationBytes = bytes('');
            if (data.check.isRevealed && !data.isBlack) {
                uint256 colorIndex = data.colorIndexes[i];
                animationBytes = fillAnimation(data, colorIndex, allColors);
            }

            // Render the current check.
            checksBytes = abi.encodePacked(checksBytes, abi.encodePacked(
                '<g transform="translate(', translateX, ', ', translateY, ')">',
                    '<g transform="translate(3, 3) scale(', data.scale, ')">',
                        '<path d="M2.576 9.854c1.152-2.646.33-3.972 1.818-5.46C5.882 2.905 7.75 3.25 9.854 2.575 12.25 1.25 12.895 0 15 0c2.105 0 2.75 1.5 5.147 2.576c1.853.832 3.971.33 5.46 1.817C27.095 5.882 26.5 7.25 27.425 9.854 28.098 11.75 30 12.895 30 15c0 2.105-1.75 3.5-2.576 5.147c-.825 1.646-.33 3.971-1.818 5.46C24.118 27.095 22.5 26.5 20.147 27.425 18.25 28.17 17.105 30 15 30c-2.105 0-3.25-1.5-5.146-2.576c-1.896-1.075-3.972-.33-5.46-1.818C2.905 24.118 3.25 22.25 2.576 20.147 1.901 18.043 0 17.105 0 15c0-2.105 1.424-2.5 2.576-5.146Z" fill="#', color, '"',
                            animationBytes,
                        '/>',
                        '<path d="M13.736 21.5V12.338l-3.38 3.393-1.755-1.74L15.004 7.6l6.39 6.39-1.727 1.74-3.394-3.393V21.5h-2.537Z" fill="black"/>',
                    '</g>',
                '</g>'
            ));
        }

        return checksBytes;
    }

    /// @dev Collect relevant rendering data for easy access across functions.
    /// @param check Our current check loaded from storage.
    /// @param checks The DB containing all checks.
    function collectRenderData(
        IChecks.Check memory check, IChecks.Checks storage checks
    ) public view returns (CheckRenderData memory data) {
        // Carry through base settings.
        data.check = check;
        data.isBlack = check.stored.divisorIndex == 7;
        data.count = data.isBlack ? 1 : DIVISORS()[check.stored.divisorIndex];

        // Compute colors and indexes.
        (string[] memory colors_, uint256[] memory colorIndexes_) = colors(check, checks);
        data.gridColor = data.isBlack ? '#F2F2F2' : '#191919';
        data.canvasColor = data.isBlack ? '#FFF' : '#111';
        data.colorIndexes = colorIndexes_;
        data.colors = colors_;

        // Compute positioning data.
        data.scale = data.count > 20 ? '1' : data.count > 1 ? '2' : '3';
        data.spaceX = data.count == 80 ? 36 : 72;
        data.spaceY = data.count > 20 ? 36 : 72;
        data.perRow = perRow(data.count);
        data.indent = data.count == 40;
        data.rowX = rowX(data.count);
        data.rowY = rowY(data.count);
    }

    /// @dev Generate the SVG code for rows in the 8x10 Checks grid.
    function generateGridRow() public pure returns (bytes memory) {
        bytes memory row;
        for (uint256 i; i < 8; i++) {
            row = abi.encodePacked(
                row,
                '<use href="#square" x="', Utilities.uint2str(196 + i*36), '" y="160"/>'
            );
        }
        return row;
    }

    /// @dev Generate the SVG code for the entire 8x10 Checks grid.
    function generateGrid() public pure returns (bytes memory) {
        bytes memory grid;
        for (uint256 i; i < 10; i++) {
            grid = abi.encodePacked(
                grid,
                '<use href="#row" y="', Utilities.uint2str(i*36), '"/>'
            );
        }

        return abi.encodePacked('<g id="grid" x="196" y="160">', grid, '</g>');
    }

    /// @dev Generate the complete SVG code for a given Check.
    /// @param check The check to render.
    /// @param checks The DB containing all checks.
    function generateSVG(
        IChecks.Check memory check, IChecks.Checks storage checks
    ) public view returns (bytes memory) {
        CheckRenderData memory data = collectRenderData(check, checks);

        return abi.encodePacked(
            '<svg ',
                'viewBox="0 0 680 680" ',
                'fill="none" xmlns="http://www.w3.org/2000/svg" ',
                'style="width:100%;background:black;"',
            '>',
                '<defs>',
                    '<rect id="square" width="36" height="36" stroke="', data.gridColor, '"></rect>',
                    '<g id="row">', generateGridRow(), '</g>'
                '</defs>',
                '<rect width="680" height="680" fill="black"/>',
                '<rect x="188" y="152" width="304" height="376" fill="', data.canvasColor, '"/>',
                generateGrid(),
                generateChecks(data),
                '<rect width="680" height="680" fill="transparent">',
                    '<animate ',
                        'attributeName="width" ',
                        'from="680" ',
                        'to="0" ',
                        'dur="0.2s" ',
                        'begin="click" ',
                        'fill="freeze" ',
                        'id="animation"',
                    '/>',
                '</rect>',
            '</svg>'
        );
    }
}

/// @dev Bag holding all data relevant for rendering.
struct CheckRenderData {
    IChecks.Check check;
    uint256[] colorIndexes;
    string[] colors;
    string canvasColor;
    string gridColor;
    string duration;
    string scale;
    uint32 seed;
    uint16 rowX;
    uint16 rowY;
    uint8 count;
    uint8 spaceX;
    uint8 spaceY;
    uint8 perRow;
    uint8 indexInRow;
    uint8 isIndented;
    bool isNewRow;
    bool isBlack;
    bool indent;
}
