import { Abi } from 'viem';

/**
 * Contract addresses for different environments
 */
export const WARPS_CONTRACT_ADDRESSES = {
  production: '0x1EE8da4d492aCbd8F28b79F8157060A8cCd1a374' as `0x${string}`,
  development: '0x4087a72e96a6125ec7dae02852f90828c928aa6d' as `0x${string}`,
};

export const PAYMENT_TOKEN_DDRESSES = {
  production: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as `0x${string}`,
  development: '0xB1d4113a03F4e18Ea868E0F60c7214D6061532D8' as `0x${string}`,
};

/**
 * Determines if the application is running in development mode
 */
// const isWarpsDevelopment = process.env.NODE_ENV === 'development';
const isWarpsDevelopment = false;

/**
 * Get the appropriate contract address based on the current environment
 */
const getWarpsContractAddress = (): `0x${string}` => {
  return isWarpsDevelopment
    ? WARPS_CONTRACT_ADDRESSES.development
    : WARPS_CONTRACT_ADDRESSES.production;
};

export const WARPS_CONTRACT = {
  address: getWarpsContractAddress(),
  abi: [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    {
      type: 'function',
      name: 'MAX_COMPOSITE_LEVEL',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'approve',
      inputs: [
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'balanceOf',
      inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'burn',
      inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'claimPrize',
      inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'composite',
      inputs: [
        { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
        { name: 'burnId', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'depositTokens',
      inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'emergencyWithdraw',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'freeMint',
      inputs: [{ name: 'recipient', type: 'address', internalType: 'address' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'getActualAvailable',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getApproved',
      inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getAvailablePrizePool',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getColorFromIndex',
      inputs: [{ name: '_index', type: 'uint8', internalType: 'uint8' }],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'pure',
    },
    {
      type: 'function',
      name: 'getCurrentWinningColor',
      inputs: [],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getIndexFromColor',
      inputs: [{ name: '_color', type: 'string', internalType: 'string' }],
      outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
      stateMutability: 'pure',
    },
    {
      type: 'function',
      name: 'getTotalDeposited',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'hasUsedFreeMint',
      inputs: [{ name: '', type: 'address', internalType: 'address' }],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'isApprovedForAll',
      inputs: [
        { name: 'owner', type: 'address', internalType: 'address' },
        { name: 'operator', type: 'address', internalType: 'address' },
      ],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'isWinningToken',
      inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'mint',
      inputs: [{ name: 'recipient', type: 'address', internalType: 'address' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'mintLimit',
      inputs: [],
      outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'mintPrice',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'name',
      inputs: [],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'owner',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'ownerMintSharePercentage',
      inputs: [],
      outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'ownerOf',
      inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'pause',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'paused',
      inputs: [],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'paymentToken',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'contract IERC20' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'prizePool',
      inputs: [],
      outputs: [
        { name: 'lastWinnerClaim', type: 'uint32', internalType: 'uint32' },
        { name: 'totalDeposited', type: 'uint256', internalType: 'uint256' },
        { name: 'actualAvailable', type: 'uint256', internalType: 'uint256' },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'renounceOwnership',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'safeTransferFrom',
      inputs: [
        { name: 'from', type: 'address', internalType: 'address' },
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'safeTransferFrom',
      inputs: [
        { name: 'from', type: 'address', internalType: 'address' },
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
        { name: 'data', type: 'bytes', internalType: 'bytes' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'setApprovalForAll',
      inputs: [
        { name: 'operator', type: 'address', internalType: 'address' },
        { name: 'approved', type: 'bool', internalType: 'bool' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'setPaymentToken',
      inputs: [
        { name: '_tokenAddress', type: 'address', internalType: 'address' },
        { name: '_mintPrice', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'setWinningColor',
      inputs: [{ name: 'colorHex', type: 'string', internalType: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'supportsInterface',
      inputs: [{ name: 'interfaceId', type: 'bytes4', internalType: 'bytes4' }],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'symbol',
      inputs: [],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenByIndex',
      inputs: [{ name: 'index', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenMintId',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenOfOwnerByIndex',
      inputs: [
        { name: 'owner', type: 'address', internalType: 'address' },
        { name: 'index', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'tokenURI',
      inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'totalSupply',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'transferFrom',
      inputs: [
        { name: 'from', type: 'address', internalType: 'address' },
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'transferOwnership',
      inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'unpause',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'updateMintLimit',
      inputs: [{ name: 'newLimit', type: 'uint8', internalType: 'uint8' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'updateMintPrice',
      inputs: [{ name: 'newPrice', type: 'uint256', internalType: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'updateOwnerMintSharePercentage',
      inputs: [{ name: 'newPercentage', type: 'uint8', internalType: 'uint8' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'updateWinnerClaimPercentage',
      inputs: [{ name: 'newPercentage', type: 'uint8', internalType: 'uint8' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'updateWinningColorIndex',
      inputs: [{ name: 'newIndex', type: 'uint8', internalType: 'uint8' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'winnerClaimPercentage',
      inputs: [],
      outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'winningColorIndex',
      inputs: [],
      outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
      stateMutability: 'view',
    },
    {
      type: 'event',
      name: 'Approval',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'approved',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ApprovalForAll',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'operator',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'approved',
          type: 'bool',
          indexed: false,
          internalType: 'bool',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'Composite',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'burnedId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        { name: 'warps', type: 'uint8', indexed: true, internalType: 'uint8' },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ContractPaused',
      inputs: [
        {
          name: 'pauser',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ContractUnpaused',
      inputs: [
        {
          name: 'unpauser',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'EmergencyWithdrawn',
      inputs: [
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'FreeMintUsed',
      inputs: [
        {
          name: 'recipient',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'MetadataUpdate',
      inputs: [
        {
          name: '_tokenId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'MintLimitUpdated',
      inputs: [
        {
          name: 'newLimit',
          type: 'uint8',
          indexed: false,
          internalType: 'uint8',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'MintPriceUpdated',
      inputs: [
        {
          name: 'newPrice',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'OwnerMintSharePercentageUpdated',
      inputs: [
        {
          name: 'newPercentage',
          type: 'uint8',
          indexed: false,
          internalType: 'uint8',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'OwnershipTransferred',
      inputs: [
        {
          name: 'previousOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'newOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'Paused',
      inputs: [
        {
          name: 'account',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'PaymentTokenSet',
      inputs: [
        {
          name: 'tokenAddress',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'mintPrice',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'PrizeClaimed',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'winner',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'PrizePoolUpdated',
      inputs: [
        {
          name: 'totalDeposited',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'Sacrifice',
      inputs: [
        {
          name: 'burnedId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'TokenBurned',
      inputs: [
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'burner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'TokensComposited',
      inputs: [
        {
          name: 'keptTokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'burnedTokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'TokensDeposited',
      inputs: [
        {
          name: 'sender',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'TokensMinted',
      inputs: [
        {
          name: 'recipient',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'startTokenId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'count',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'Transfer',
      inputs: [
        {
          name: 'from',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        { name: 'to', type: 'address', indexed: true, internalType: 'address' },
        {
          name: 'tokenId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'Unpaused',
      inputs: [
        {
          name: 'account',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'WinnerClaimPercentageUpdated',
      inputs: [
        {
          name: 'newPercentage',
          type: 'uint8',
          indexed: false,
          internalType: 'uint8',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'WinningColorIndexUpdated',
      inputs: [
        {
          name: 'newIndex',
          type: 'uint8',
          indexed: false,
          internalType: 'uint8',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'WinningColorSet',
      inputs: [
        {
          name: 'colorHex',
          type: 'string',
          indexed: false,
          internalType: 'string',
        },
        {
          name: 'colorIndex',
          type: 'uint8',
          indexed: false,
          internalType: 'uint8',
        },
      ],
      anonymous: false,
    },
    { type: 'error', name: 'BlackWarp__InvalidWarp', inputs: [] },
    { type: 'error', name: 'ERC721__InvalidApproval', inputs: [] },
    { type: 'error', name: 'ERC721__InvalidOwner', inputs: [] },
    { type: 'error', name: 'ERC721__InvalidToken', inputs: [] },
    { type: 'error', name: 'ERC721__NotAllowed', inputs: [] },
    { type: 'error', name: 'ERC721__TokenExists', inputs: [] },
    { type: 'error', name: 'ERC721__TransferToNonReceiver', inputs: [] },
    { type: 'error', name: 'ERC721__TransferToZero', inputs: [] },
    { type: 'error', name: 'InvalidTokenCount', inputs: [] },
    { type: 'error', name: 'NotAllowed', inputs: [] },
  ] as const satisfies Abi,
} as const;

const getPaymentTokenContractAddress = (): `0x${string}` => {
  return isWarpsDevelopment
    ? PAYMENT_TOKEN_DDRESSES.development
    : PAYMENT_TOKEN_DDRESSES.production;
};

export const PAYMENT_TOKEN_CONTRACT = {
  address: getPaymentTokenContractAddress(),
  abi: [
    {
      type: 'constructor',
      inputs: [{ name: '_owner', type: 'address', internalType: 'address' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'INITIAL_SUPPLY',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'allowance',
      inputs: [
        { name: 'owner', type: 'address', internalType: 'address' },
        { name: 'spender', type: 'address', internalType: 'address' },
      ],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'approve',
      inputs: [
        { name: 'spender', type: 'address', internalType: 'address' },
        { name: 'amount', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'balanceOf',
      inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'burn',
      inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'burnFrom',
      inputs: [
        { name: 'from', type: 'address', internalType: 'address' },
        { name: 'amount', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'decimals',
      inputs: [],
      outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'decreaseAllowance',
      inputs: [
        { name: 'spender', type: 'address', internalType: 'address' },
        { name: 'subtractedValue', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'increaseAllowance',
      inputs: [
        { name: 'spender', type: 'address', internalType: 'address' },
        { name: 'addedValue', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'mint',
      inputs: [
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'amount', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'name',
      inputs: [],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'owner',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'renounceOwnership',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'symbol',
      inputs: [],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'totalSupply',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'amount', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'transferFrom',
      inputs: [
        { name: 'from', type: 'address', internalType: 'address' },
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'amount', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'transferOwnership',
      inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'event',
      name: 'Approval',
      inputs: [
        {
          name: 'owner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'spender',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'OwnershipTransferred',
      inputs: [
        {
          name: 'previousOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'newOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'Transfer',
      inputs: [
        {
          name: 'from',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        { name: 'to', type: 'address', indexed: true, internalType: 'address' },
        {
          name: 'value',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
  ] as const satisfies Abi,
} as const;
