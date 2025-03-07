'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
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

  // get total supply
  const { data: totalSupply } = useReadContract({
    address: ARROWS_CONTRACT.address as Address,
    abi: ARROWS_CONTRACT.abi,
    functionName: 'totalSupply',
  });

  // Fetch tokens owned by the user
  useEffect(() => {
    const fetchTokens = async () => {
      if (!balance) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('balance', balance);
        console.log('totalSupply', totalSupply);

        const tokens = [];

        // iterate over total supply
        for (let i = 0; i < Number(totalSupply); i++) {
          console.log('i', i);
          // check if address is owner of token
          const isOwner = await readContract(config, {
            address: ARROWS_CONTRACT.address as Address,
            abi: ARROWS_CONTRACT.abi,
            functionName: 'ownerOf',
            args: [BigInt(i)],
          });

          console.log('isOwner', isOwner);

          if (isOwner === address) {
            // get token metadata
            const tokenMetadata = await readContract(config, {
              address: ARROWS_CONTRACT.address as Address,
              abi: ARROWS_CONTRACT.abi,
              functionName: 'tokenURI',
              args: [BigInt(i)],
            });

            const token = {
              ...decodeBase64URI(tokenMetadata),
              id: i,
            };

            tokens.push(token);
          }
        }

        console.log('tokens', tokens);
        setTokens(tokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchTokens();
  }, [balance]);

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Arrows</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view your arrows
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Arrows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  console.log('tokens', tokens);

  return (
    <div className="grid grid-cols-2">
      {tokens.map((token) => (
        <div key={`token-${token.id}`}>
          <div
            className="w-full h-auto mb-2"
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
