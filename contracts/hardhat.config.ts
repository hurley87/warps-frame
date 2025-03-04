import '@nomicfoundation/hardhat-toolbox-viem';

require('dotenv').config();

// Get environment variables or use defaults
const WALLET_KEY = process.env.WALLET_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY || '';

const config = {
  solidity: '0.8.28',
  networks: {
    hardhat: {
      // Local development network
    },
    'base-mainnet': {
      url: 'https://mainnet.base.org',
      accounts: [WALLET_KEY],
      gasPrice: 1000000000,
    },
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: [WALLET_KEY],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      'base-mainnet': ETHERSCAN_KEY,
      'base-sepolia': ETHERSCAN_KEY,
    },
    customChains: [
      {
        network: 'base-mainnet',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org',
        },
      },
      {
        network: 'base-sepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org',
        },
      },
    ],
  },
  defaultNetwork: 'hardhat',
};

export default config;
