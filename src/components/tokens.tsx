'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { type Address } from 'viem';
import { readContract } from '@wagmi/core';
import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

interface Token {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

export function Tokens() {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const decodeBase64URI = (uri: string) => {
    const json = Buffer.from(uri.substring(29), 'base64').toString();
    return JSON.parse(json);
  };

  // Get user's token balance
  const { data: balance } = useReadContract({
    address: ARROWS_CONTRACT.address as Address,
    abi: ARROWS_CONTRACT.abi,
    functionName: 'balanceOf',
    args: address ? [address as Address] : undefined,
  });

  // Fetch tokens owned by the user
  useEffect(() => {
    const fetchTokens = async () => {
      if (!balance || !address) {
        setIsLoading(false);
        return;
      }

      try {
        const tokens = [];
        const balanceNum = Number(balance);

        // Get each token owned by the address using tokenOfOwnerByIndex
        for (let i = 0; i < balanceNum; i++) {
          const tokenId = await readContract(config, {
            address: ARROWS_CONTRACT.address as Address,
            abi: ARROWS_CONTRACT.abi,
            functionName: 'tokenOfOwnerByIndex',
            args: [address as Address, BigInt(i)],
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

        setTokens(tokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchTokens();
  }, [balance, address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          Connect your wallet to view your arrows
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative aspect-square">
            <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/20 to-primary/0 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  console.log('tokens', tokens);

  return (
    <div className="grid grid-cols-2 gap-4">
      {tokens.map((token) => (
        <div key={`token-${token.id}`} className="relative aspect-square">
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{
              __html: token.image?.startsWith('data:image/svg+xml;base64,')
                ? atob(token.image.split(',')[1])
                : '',
            }}
          />
        </div>
      ))}
    </div>
  );
}
