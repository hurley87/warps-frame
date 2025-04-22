'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useInfiniteTokens } from '@/hooks/use-tokens';
import { Token } from '@/components/token';
import { ClaimPrize } from '@/components/claim-prize';
import { CompositeDialog } from '@/components/composite-dialog';
import { toast } from 'sonner';
import { Mint } from '@/components/mint';
import { Pool } from '@/components/pool';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatedWarp } from './animated-warp';
import { AlertCircle } from 'lucide-react';

import { Alert, AlertTitle } from '@/components/ui/alert';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black backdrop-blur-sm z-10 flex items-center justify-center min-h-screen h-full">
      <div className="bg-background/20 rounded-lg shadow-lg p-6 max-w-sm mx-auto flex flex-col items-center pb-20">
        <Image
          src="/splash.jpg"
          height={256}
          width={256}
          alt="loading"
          className="mx-auto animate-pulse"
        />
        <div className="text-center mb-32">
          <p className="text-primary mb-2 font-bold">Loading Warps...</p>
          <div className="flex justify-center space-x-2">
            <div
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Tokens() {
  const { address } = useAccount();
  const {
    tokens = [],
    isLoading,
    isFetching,
    hasMore,
    loadMore,
  } = useInfiniteTokens(address);

  const [showCompositeDialog, setShowCompositeDialog] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [selectedPair, setSelectedPair] = useState<{
    source: number;
    target: number;
  } | null>(null);
  const [evolvedTokenId, setEvolvedTokenId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Reset the evolved token highlight after a delay
  useEffect(() => {
    if (evolvedTokenId !== null) {
      const timer = setTimeout(() => {
        setEvolvedTokenId(null);
      }, 5000); // Highlight for 5 seconds

      return () => clearTimeout(timer);
    }
  }, [evolvedTokenId]);

  const handleTokenSelect = (tokenId: number) => {
    // If the token is already selected, unselect it
    if (selectedTokenId === tokenId) {
      setSelectedTokenId(null);
      return;
    }

    // If no token is selected, select this one
    if (selectedTokenId === null) {
      setSelectedTokenId(tokenId);
      return;
    }

    // If another token is already selected, check if they can be combined
    const sourceToken = tokens.find((t) => t.id === selectedTokenId);
    const targetToken = tokens.find((t) => t.id === tokenId);

    if (!sourceToken || !targetToken) return;

    const sourceColorBand = sourceToken.attributes.find(
      (attr) => attr.trait_type === 'Warps'
    )?.value;
    const targetColorBand = targetToken.attributes.find(
      (attr) => attr.trait_type === 'Warps'
    )?.value;

    // Check if both are single warp (value "1")
    if (sourceColorBand === '1' && targetColorBand === '1') {
      toast.error(
        'Single warp cannot be combined. Find warps with more bands.'
      );
      // Select the new token instead
      setSelectedTokenId(tokenId);
      return;
    }

    if (
      sourceColorBand &&
      targetColorBand &&
      sourceColorBand === targetColorBand
    ) {
      setSelectedPair({ source: selectedTokenId, target: tokenId });
      setShowCompositeDialog(true);
    } else {
      toast.error('Tokens must have the same number of warps');
      // Select the new token instead
      setSelectedTokenId(tokenId);
    }
  };

  const handleCompositeComplete = (newEvolvedTokenId?: number) => {
    // Reset selection states immediately
    setSelectedPair(null);
    setSelectedTokenId(null);

    // Dialog is already closed by the CompositeDialog component

    // If we have an evolved token ID, highlight it and refresh data
    if (newEvolvedTokenId) {
      setEvolvedTokenId(newEvolvedTokenId);

      // Force refetch tokens to update UI
      queryClient.invalidateQueries({
        queryKey: ['tokens-balance'],
      });
      queryClient.invalidateQueries({
        queryKey: ['tokens-metadata'],
      });
    }
  };

  // if (isLoading) {
  //   return <LoadingScreen />;
  // }

  // Check if user has any winning tokens
  const winningToken = tokens.find((token) => token.isWinning);

  if (winningToken) {
    return <ClaimPrize token={winningToken} />;
  }

  const sourceToken = selectedPair
    ? tokens.find((t) => t.id === selectedPair.source) ?? null
    : null;
  const targetToken = selectedPair
    ? tokens.find((t) => t.id === selectedPair.target) ?? null
    : null;

  console.log('tokens', tokens);

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-6 space-y-6 text-center pt-0">
        <div className="relative w-64 h-64 mb-2 flex items-center justify-center my-4">
          <AnimatedWarp className="w-54 h-54 mx-auto" />
        </div>

        <div className="space-y-3 max-w-xs">
          <div className="relative font-bold text-2xl pb-1">
            Win <Pool showWinningAmount />
          </div>
          <p className="text-muted-foreground">
            Find a single warp with the winning color and burn it to claim{' '}
            <Pool showWinningAmount />.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <Mint />
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-4 bg-[#342942] overflow-hidden">
      {isFetching && <LoadingScreen />}

      {tokens.length === 1 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle> To continue, you have to mint more warps.</AlertTitle>
        </Alert>
      )}

      <div className="flex flex-col">
        <div className="grid grid-cols-3 gap-4">
          {[...tokens]
            .sort((a, b) => b.id - a.id)
            .map((token) => (
              <Token
                key={`token-${token.id}`}
                token={token}
                onSelect={handleTokenSelect}
                isSelected={selectedTokenId === token.id}
                isBurnToken={
                  selectedPair?.target === token.id ||
                  (selectedTokenId !== null &&
                    selectedTokenId !== token.id &&
                    evolvedTokenId !== token.id)
                }
                isEvolvedToken={evolvedTokenId === token.id}
              />
            ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-6 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              className="px-6"
            >
              Load More
            </Button>
          </div>
        )}
      </div>

      <CompositeDialog
        open={showCompositeDialog}
        onOpenChange={setShowCompositeDialog}
        sourceToken={sourceToken}
        targetToken={targetToken}
        selectedPair={selectedPair}
        onCompositeComplete={handleCompositeComplete}
      />
    </div>
  );
}
