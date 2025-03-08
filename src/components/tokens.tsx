'use client';

import { useAccount } from 'wagmi';
import { useTokens, useClaimPrize } from '@/hooks/use-tokens';
import { Token } from '@/components/token';
import { Composite } from '@/components/composite';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function Tokens() {
  const { address, isConnected } = useAccount();
  const { data: tokens = [], isLoading, isFetching } = useTokens(address);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const claimPrize = useClaimPrize();
  const [isClaimingPrize, setIsClaimingPrize] = useState(false);

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

  const handleClaimPrize = async (tokenId: number) => {
    try {
      setIsClaimingPrize(true);
      await claimPrize(tokenId);
      // Success state will be handled by the query invalidation
    } catch (error) {
      console.error('Failed to claim prize:', error);
      // You could add a toast notification here for the error
    } finally {
      setIsClaimingPrize(false);
    }
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
      <div className="grid grid-cols-3 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="relative aspect-square">
            <img
              src="/loadingarrow.svg"
              alt="Loading"
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Check if user has any winning tokens
  const winningToken = tokens.find((token) => token.isWinning);

  if (winningToken) {
    return (
      <div className="relative p-4">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-green-500 mb-2">
            🎉 Congratulations! You've Won! 🎉
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            You have a winning arrow! Claim your prize now.
          </p>
        </div>
        <div className="max-w-sm mx-auto">
          <Token
            key={`token-${winningToken.id}`}
            token={winningToken}
            isSelected={false}
            onSelect={() => {}}
          />
          <Button
            className="w-full mt-4 bg-green-500 hover:bg-green-600"
            onClick={() => handleClaimPrize(winningToken.id)}
            disabled={isClaimingPrize}
          >
            {isClaimingPrize ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming Prize...
              </>
            ) : (
              'Claim Prize 🏆'
            )}
          </Button>
        </div>
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
