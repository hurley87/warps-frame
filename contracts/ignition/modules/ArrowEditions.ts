import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ArrowEditionsModule = buildModule("ArrowEditions", (m) => {
  // Deploy the ArrowEditions contract with initial parameters
  const arrowEditions = m.contract("ArrowEditions", [
    "Arrows",                                 // name
    "ARROWS",                                         // symbol
    "ipfs://bafkreifpjmf5m4n77e3cx5gsaxmqdtjfbg4na3ftwvfvvvd3ezwb6nsbky", // metadataURI
    10000                                            // maxTokenSupply
  ]);

  return { arrowEditions };
});

export default ArrowEditionsModule; 