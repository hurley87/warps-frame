//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/IArrows.sol";
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

    /// @dev The semiperfect divisors of the 80 arrows.
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

    /// @dev Load a arrow from storage and fill its current state settings.
    /// @param tokenId The id of the arrow to fetch.
    /// @param arrows The DB containing all arrows.
    function getArrow(
        uint256 tokenId, IArrows.Arrows storage arrows
    ) public view returns (IArrows.Arrow memory arrow) {
        IArrows.StoredArrow memory stored = arrows.all[tokenId];

        return getArrow(tokenId, stored.divisorIndex, arrows);
    }

    /// @dev Load a arrow from storage and fill its current state settings.
    /// @param tokenId The id of the arrow to fetch.
    /// @param divisorIndex The divisorindex to get.
    /// @param arrows The DB containing all arrows.
    function getArrow(
        uint256 tokenId, uint8 divisorIndex, IArrows.Arrows storage arrows
    ) public view returns (IArrows.Arrow memory arrow) {
        IArrows.StoredArrow memory stored = arrows.all[tokenId];
        stored.divisorIndex = divisorIndex; // Override in case we're fetching specific state.
        arrow.stored = stored;

        // Set up the source of randomness + seed for this Arrow.
        arrow.seed = uint256(keccak256(abi.encodePacked(block.prevrandao, stored.seed))) % type(uint128).max;

        // Helpers
        arrow.isRoot = divisorIndex == 0;
        arrow.hasManyArrows = divisorIndex < 6;
        arrow.composite = !arrow.isRoot && divisorIndex < 7 ? stored.composites[divisorIndex - 1] : 0;

        // Token properties
        arrow.colorBand = colorBandIndex(arrow, divisorIndex);
        arrow.gradient = gradientIndex(arrow, divisorIndex);
        arrow.arrowsCount = DIVISORS()[divisorIndex];
        arrow.speed = uint8(2**(arrow.seed % 3));
        arrow.direction = uint8(arrow.seed % 2);
    }

    /// @dev Query the gradient of a given arrow at a certain arrow count.
    /// @param arrow The arrow we want to get the gradient for.
    /// @param divisorIndex The arrow divisor in question.
    function gradientIndex(IArrows.Arrow memory arrow, uint8 divisorIndex) public pure returns (uint8) {
        uint256 n = Utilities.random(arrow.seed, 'gradient', 100);

        return divisorIndex == 0
            ? n < 20 ? uint8(1 + (n % 6)) : 0
            : divisorIndex < 6
                ? arrow.stored.gradients[divisorIndex - 1]
                : 0;
    }

    /// @dev Query the color band of a given arrow at a certain arrow count.
    /// @param arrow The arrow we want to get the color band for.
    /// @param divisorIndex The arrow divisor in question.
    function colorBandIndex(IArrows.Arrow memory arrow, uint8 divisorIndex) public pure returns (uint8) {
        uint256 n = Utilities.random(arrow.seed, 'band', 120);

        return divisorIndex == 0
            ?   ( n > 80 ? 0
                : n > 40 ? 1
                : n > 20 ? 2
                : n > 10 ? 3
                : n >  4 ? 4
                : n >  1 ? 5
                : 6 )
            : divisorIndex < 6
                ? arrow.stored.colorBands[divisorIndex - 1]
                : 6;
    }

    /// @dev Generate indexes for the color slots of arrow parents (up to the EightyColors.COLORS themselves).
    /// @param divisorIndex The current divisorIndex to query.
    /// @param arrow The current arrow to investigate.
    /// @param arrows The DB containing all arrows.
    function colorIndexes(
        uint8 divisorIndex, IArrows.Arrow memory arrow, IArrows.Arrows storage arrows
    )
        public view returns (uint256[] memory)
    {
        uint8[8] memory divisors = DIVISORS();
        uint256 arrowsCount = divisors[divisorIndex];
        uint256 seed = arrow.seed;
        uint8 colorBand = COLOR_BANDS()[colorBandIndex(arrow, divisorIndex)];
        uint8 gradient = GRADIENTS()[gradientIndex(arrow, divisorIndex)];

        // If we're a composited arrow, we choose colors only based on
        // the slots available in our parents. Otherwise,
        // we choose based on our available spectrum.
        uint256 possibleColorChoices = divisorIndex > 0
            ? divisors[divisorIndex - 1] * 2
            : 80;

        // We initialize our index and select the first color
        uint256[] memory indexes = new uint256[](arrowsCount);
        indexes[0] = Utilities.random(seed, possibleColorChoices);

        // If we have more than one arrow, continue selecting colors
        if (arrow.hasManyArrows) {
            if (gradient > 0) {
                // If we're a gradient arrow, we select based on the color band looping around
                // the 80 possible colors
                for (uint256 i = 1; i < arrowsCount;) {
                    indexes[i] = (indexes[0] + (i * gradient * colorBand / arrowsCount) % colorBand) % 80;
                    unchecked { ++i; }
                }
            } else if (divisorIndex == 0) {
                // If we select initial non gradient colors, we just take random ones
                // available in our color band
                for (uint256 i = 1; i < arrowsCount;) {
                    indexes[i] = (indexes[0] + Utilities.random(seed + i, colorBand)) % 80;
                    unchecked { ++i; }
                }
            } else {
                // If we have parent arrows, we select our colors from their set
                for (uint256 i = 1; i < arrowsCount;) {
                    indexes[i] = Utilities.random(seed + i, possibleColorChoices);
                    unchecked { ++i; }
                }
            }
        }

        // We resolve our color indexes through our parent tree until we reach the root arrows
        if (divisorIndex > 0) {
            uint8 previousDivisor = divisorIndex - 1;

            // We already have our current arrow, but need the our parent state color indices
            uint256[] memory parentIndexes = colorIndexes(previousDivisor, arrow, arrows);

            // We also need to fetch the colors of the arrow that was composited into us
            IArrows.Arrow memory composited = getArrow(arrow.composite, previousDivisor, arrows);
            uint256[] memory compositedIndexes = colorIndexes(previousDivisor, composited, arrows);

            // Replace random indices with parent / root color indices
            uint8 count = divisors[previousDivisor];

            // We always select the first color from our parent
            uint256 initialBranchIndex = indexes[0] % count;
            indexes[0] = indexes[0] < count
                ? parentIndexes[initialBranchIndex]
                : compositedIndexes[initialBranchIndex];

            // If we don't have a gradient, we continue resolving from our parent for the remaining arrows
            if (gradient == 0) {
                for (uint256 i; i < arrowsCount;) {
                    uint256 branchIndex = indexes[i] % count;
                    indexes[i] = indexes[i] < count
                        ? parentIndexes[branchIndex]
                        : compositedIndexes[branchIndex];

                    unchecked { ++i; }
                }
            // If we have a gradient we base the remaining colors off our initial selection
            } else {
                for (uint256 i = 1; i < arrowsCount;) {
                    indexes[i] = (indexes[0] + (i * gradient * colorBand / arrowsCount) % colorBand) % 80;

                    unchecked { ++i; }
                }
            }
        }

        return indexes;
    }

    /// @dev Fetch all colors of a given Arrow.
    /// @param arrow The arrow to get colors for.
    /// @param arrows The DB containing all arrows.
    function colors(
        IArrows.Arrow memory arrow, IArrows.Arrows storage arrows
    ) public view returns (string[] memory, uint256[] memory) {
        // A fully composited arrow has no color.
        if (arrow.stored.divisorIndex == 7) {
            string[] memory zeroColors = new string[](1);
            uint256[] memory zeroIndexes = new uint256[](1);
            zeroColors[0] = '000';
            zeroIndexes[0] = 999;
            return (zeroColors, zeroIndexes);
        }

        // Fetch the indices on the original color mapping.
        uint256[] memory indexes = colorIndexes(arrow.stored.divisorIndex, arrow, arrows);

        // Map over to get the colors.
        string[] memory arrowColors = new string[](indexes.length);
        string[80] memory allColors = EightyColors.COLORS();

        // Always set the first color.
        arrowColors[0] = allColors[indexes[0]];

        // Resolve each additional check color via their index in EightyColors.COLORS.
        for (uint256 i = 1; i < indexes.length; i++) {
            arrowColors[i] = allColors[indexes[i]];
        }

        return (arrowColors, indexes);
    }

    /// @dev Get the number of arrows we should display per row.
    /// @param arrows The number of arrows in the piece.
    function perRow(uint8 arrows) public pure returns (uint8) {
        return arrows == 80
            ? 8
            : arrows >= 20
                ? 4
                : arrows == 10 || arrows == 4
                    ? 2
                    : 1;
    }

    /// @dev Get the X-offset for positioning arrow horizontally.
    /// @param arrows The number of arrows in the piece.
    function rowX(uint8 arrows) public pure returns (uint16) {
        return arrows <= 1
            ? 286
            : arrows == 5
                ? 304
                : arrows == 10 || arrows == 4
                    ? 268
                    : 196;
    }

    /// @dev Get the Y-offset for positioning arrow vertically.
    /// @param arrows The number of arrows in the piece.
    function rowY(uint8 arrows) public pure returns (uint16) {
        return arrows > 4
            ? 160
            : arrows == 4
                ? 268
                : arrows > 1
                    ? 304
                    : 286;
    }

    /// @dev Get the animation SVG snipped for an individual check of a piece.
    /// @param data The data object containing rendering settings.
    /// @param offset The index position of the check in question.
    /// @param allColors All available colors.
    function fillAnimation(
        ArrowRenderData memory data,
        uint256 offset,
        string[80] memory allColors
    ) public pure returns (bytes memory)
    {
        // We only pick 20 colors from our gradient to reduce execution time.
        uint8 count = 20;

        bytes memory values;

        // Reverse loop through our color gradient.
        if (data.arrow.direction == 0) {
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
                'dur="',Utilities.uint2str(count * 2 / data.arrow.speed),'s" begin="animation.begin" ',
                'repeatCount="indefinite" ',
            '/>'
        );
    }

    /// @dev Generate the SVG code for all arrows in a given token.
    /// @param data The data object containing rendering settings.
    function generateArrows(ArrowRenderData memory data) public pure returns (bytes memory) {
        bytes memory arrowsBytes;
        string[80] memory allColors = EightyColors.COLORS();

        uint8 arrowsCount = data.count;
        for (uint8 i; i < arrowsCount; i++) {
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
            string memory color = data.colors[i];
            
            // Get animation bytes if needed
            bytes memory animationBytes = bytes('');
            if (!data.isBlack && !data.isStatic) {
                uint256 colorIndex = data.colorIndexes[i];
                animationBytes = fillAnimation(data, colorIndex, allColors);
            }

            // Render the current arrow.
            arrowsBytes = abi.encodePacked(arrowsBytes, abi.encodePacked(
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

        return arrowsBytes;
    }

    /// @dev Collect relevant rendering data for easy access across functions.
    /// @param arrow Our current arrow loaded from storage.
    /// @param arrows The DB containing all arrows.
    function collectRenderData(
        IArrows.Arrow memory arrow, IArrows.Arrows storage arrows
    ) public view returns (ArrowRenderData memory data) {
        // Carry through base settings.
        data.arrow = arrow;
        data.isBlack = arrow.stored.divisorIndex == 7;
        data.count = data.isBlack ? 1 : DIVISORS()[arrow.stored.divisorIndex];

        // Compute colors and indexes.
        (string[] memory colors_, uint256[] memory colorIndexes_) = colors(arrow, arrows);
        data.gridColor = '#000000';
        data.canvasColor = '#000000';
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

    /// @dev Generate the SVG code for rows in the 8x10 Arrows grid.
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

    /// @dev Generate the SVG code for the entire 8x10 Arrows grid.
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

    /// @dev Generate the complete SVG code for a given Arrow.
    /// @param arrow The arrow to render.
    /// @param arrows The DB containing all arrows.
    function generateSVG(
        IArrows.Arrow memory arrow, IArrows.Arrows storage arrows,
        bool isStatic
    ) public view returns (bytes memory) {
        ArrowRenderData memory data = collectRenderData(arrow, arrows);
        data.isStatic = isStatic;

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
                generateArrows(data),
                !isStatic ? bytes('<rect width="680" height="680" fill="transparent"><animate attributeName="width" from="680" to="0" dur="0.2s" begin="click" fill="freeze" id="animation"/></rect>') : bytes(''),
            '</svg>'
        );
    }

    /// @dev Generate the complete SVG code for a given Arrow.
    /// @param arrow The arrow to render.
    /// @param arrows The DB containing all arrows.
    function generateSVG(
        IArrows.Arrow memory arrow, IArrows.Arrows storage arrows
    ) public view returns (bytes memory) {
        return generateSVG(arrow, arrows, false);
    }
}

/// @dev Bag holding all data relevant for rendering.
struct ArrowRenderData {
    IArrows.Arrow arrow;
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
    bool isStatic;
}
