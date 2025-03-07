'use client';

import { useAccount } from 'wagmi';
import { useTokens } from '@/hooks/use-tokens';
import { Token } from '@/components/token';
import { Composite } from '@/components/composite';
import { useState } from 'react';

export function Tokens() {
  const { address, isConnected } = useAccount();
  const { data: tokens = [], isLoading, isFetching } = useTokens(address);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);

  console.log(tokens);
  console.log(selectedTokens);

  const handleTokenSelect = (tokenId: number) => {
    setSelectedTokens((prev) => {
      if (prev.includes(tokenId)) {
        return prev.filter((id) => id !== tokenId);
      }
      if (prev.length < 2) {
        return [...prev, tokenId];
      }
      return prev;
    });
  };

  const handleCompositeComplete = () => {
    setSelectedTokens([]);
  };

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
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg" />
            <img
              src="/loadingarrow.svg"
              alt="Loading"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative p-4">
      {isFetching && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10">
          <div className="text-sm text-muted-foreground p-2 text-center">
            Loading your arrows...
          </div>
        </div>
      )}
      <div className="mt-6">
        <Composite
          selectedTokens={selectedTokens}
          onCompositeComplete={handleCompositeComplete}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {tokens.map((token) => (
          <Token
            key={`token-${token.id}`}
            token={token}
            isSelected={selectedTokens.includes(token.id)}
            onSelect={handleTokenSelect}
          />
        ))}
      </div>
    </div>
  );
}
