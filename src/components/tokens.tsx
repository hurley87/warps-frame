'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useTokens } from '@/hooks/use-tokens';
import { Token } from '@/components/token';
import { ClaimPrize } from '@/components/claim-prize';
import { CompositeDialog } from '@/components/composite-dialog';
import { toast } from 'sonner';

export function Tokens() {
  const { address } = useAccount();
  const { data: tokens = [], isLoading, isFetching } = useTokens(address);
  const [showCompositeDialog, setShowCompositeDialog] = useState(false);
  const [selectedPair, setSelectedPair] = useState<{
    source: number;
    target: number;
  } | null>(null);

  const handleTokenDrop = (sourceId: number, targetId: number) => {
    const sourceToken = tokens.find((t) => t.id === sourceId);
    const targetToken = tokens.find((t) => t.id === targetId);

    if (!sourceToken || !targetToken) return;

    const sourceColorBand = sourceToken.attributes.find(
      (attr) => attr.trait_type === 'Arrows'
    )?.value;
    const targetColorBand = targetToken.attributes.find(
      (attr) => attr.trait_type === 'Arrows'
    )?.value;

    if (
      sourceColorBand &&
      targetColorBand &&
      sourceColorBand === targetColorBand
    ) {
      setSelectedPair({ source: sourceId, target: targetId });
      setShowCompositeDialog(true);
    } else {
      toast.error('Tokens must have the same color band to composite');
    }
  };

  const handleCompositeComplete = () => {
    setShowCompositeDialog(false);
    setSelectedPair(null);
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

  return (
    <div className="relative p-4">
      {isFetching && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10">
          <div className="text-sm text-muted-foreground p-2 text-center">
            Loading your arrows...
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {tokens.map((token) => (
          <Token
            key={`token-${token.id}`}
            token={token}
            onDrop={handleTokenDrop}
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
