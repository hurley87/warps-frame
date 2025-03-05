// import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const ArrowsModule = buildModule("Arrows", (m) => {
//   // Deploy the libraries in the correct order
//   // First deploy EightyColors which has no dependencies
//   const eightyColors = m.library("EightyColors");
  
//   // Then deploy ArrowsArt which depends on EightyColors
//   const arrowsArt = m.library("ArrowsArt", {
//     libraries: {
//       "contracts/libraries/EightyColors.sol:EightyColors": eightyColors
//     }
//   });
  
//   // Then deploy ArrowsMetadata which depends on ArrowsArt
//   const arrowsMetadata = m.library("ArrowsMetadata", {
//     libraries: {
//       "contracts/libraries/ArrowsArt.sol:ArrowsArt": arrowsArt
//     }
//   });

//   // Deploy the Arrows contract with all libraries linked
//   const arrows = m.contract("Arrows", [], {
//     libraries: {
//       "contracts/libraries/ArrowsArt.sol:ArrowsArt": arrowsArt,
//       "contracts/libraries/ArrowsMetadata.sol:ArrowsMetadata": arrowsMetadata
//     }
//   });

//   return { arrows, arrowsArt, arrowsMetadata, eightyColors };
// });

// export default ArrowsModule; 