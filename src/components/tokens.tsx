'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useTokens } from '@/hooks/use-tokens';
import { Token } from '@/components/token';
import { ClaimPrize } from '@/components/claim-prize';
import { CompositeDialog } from '@/components/composite-dialog';
import { toast } from 'sonner';
import { Mint } from '@/components/mint';
import { Pool } from '@/components/pool';

export function Tokens() {
  const { address } = useAccount();
  const { data: tokens = [], isLoading, isFetching } = useTokens(address);
  const [showCompositeDialog, setShowCompositeDialog] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [selectedPair, setSelectedPair] = useState<{
    source: number;
    target: number;
  } | null>(null);
  const [evolvedTokenId, setEvolvedTokenId] = useState<number | null>(null);

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
      (attr) => attr.trait_type === 'Arrows'
    )?.value;
    const targetColorBand = targetToken.attributes.find(
      (attr) => attr.trait_type === 'Arrows'
    )?.value;

    // Check if both are single arrows (value "1")
    if (sourceColorBand === '1' && targetColorBand === '1') {
      toast.error(
        'Single arrows cannot be combined. Find arrows with more bands.'
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
      toast.error('Tokens must have the same number of arrows');
      // Select the new token instead
      setSelectedTokenId(tokenId);
    }
  };

  const handleCompositeComplete = (newEvolvedTokenId?: number) => {
    setShowCompositeDialog(false);
    setSelectedPair(null);
    setSelectedTokenId(null);

    // If we have an evolved token ID, set it to be highlighted
    if (newEvolvedTokenId) {
      setEvolvedTokenId(newEvolvedTokenId);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="relative aspect-square">
            <Image
              src="/loadingarrow.svg"
              alt="Loading"
              width={300}
              height={300}
              className="absolute inset-0 w-full h-full"
              priority={i < 4} // Prioritize loading first 4 images
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
    return <ClaimPrize token={winningToken} />;
  }

  const sourceToken = selectedPair
    ? tokens.find((t) => t.id === selectedPair.source) ?? null
    : null;
  const targetToken = selectedPair
    ? tokens.find((t) => t.id === selectedPair.target) ?? null
    : null;

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-6 space-y-6 text-center pt-0">
        <div className="relative w-64 h-64 mb-2">
          <Image
            src="/loadingarrow.svg"
            alt="Arrow"
            width={256}
            height={256}
            className="animate-pulse"
            priority
          />
        </div>

        <div className="space-y-3 max-w-xs">
          <div className="flex items-center gap-2 text-primary justify-center">
            <span className="text-sm font-medium">Current Prize Pool</span>
          </div>
          <div className="relative font-bold text-2xl pb-1">
            <Pool />
          </div>
          <p className="text-muted-foreground">
            Every mint contributes to the prize pool. Evolve your arrows by
            combining matching pairs. The first to find the higher arrow can
            claim the entire prize pool.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <Mint />
          <p className="text-xs text-muted-foreground">
            Minting costs 0.01 ETH for a pack of 8 arrows
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-4">
      {isFetching && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center">
          <div className="bg-background/90 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
            <h3 className="font-bold text-xl text-primary mb-4 text-center pt-20">
              How to Play
            </h3>
            <ol className="space-y-3 text-lg">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Click on one arrow to select it</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>
                  Click on another arrow with the same number of arrows to
                  combine them
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Your goal is to get the higher green arrow!</span>
              </li>
            </ol>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {tokens.map((token) => (
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
