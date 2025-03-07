import { useQuery } from '@tanstack/react-query';
import { readContract } from '@wagmi/core';
import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { type Address } from 'viem';

const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export interface Token {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

const decodeBase64URI = (uri: string) => {
  const json = Buffer.from(uri.substring(29), 'base64').toString();
  return JSON.parse(json);
};

export function useTokens(address: Address | undefined) {
  return useQuery({
    queryKey: ['tokens', address],
    queryFn: async () => {
      if (!address) return [];

      // Get user's token balance
      const balance = await readContract(config, {
        address: ARROWS_CONTRACT.address as Address,
        abi: ARROWS_CONTRACT.abi,
        functionName: 'balanceOf',
        args: [address],
      });

      const tokens: Token[] = [];
      const balanceNum = Number(balance);

      // Get each token owned by the address using tokenOfOwnerByIndex
      for (let i = 0; i < balanceNum; i++) {
        const tokenId = await readContract(config, {
          address: ARROWS_CONTRACT.address as Address,
          abi: ARROWS_CONTRACT.abi,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(i)],
        });

        // Get token metadata
        const tokenMetadata = await readContract(config, {
          address: ARROWS_CONTRACT.address as Address,
          abi: ARROWS_CONTRACT.abi,
          functionName: 'tokenURI',
          args: [tokenId],
        });

        const token = {
          ...decodeBase64URI(tokenMetadata),
          id: Number(tokenId),
        };

        tokens.push(token);
      }

      return tokens;
    },
    enabled: !!address,
  });
}
