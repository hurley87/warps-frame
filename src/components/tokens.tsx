'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useTokens, useClaimPrize } from '@/hooks/use-tokens';
import { Token } from '@/components/token';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Composite } from '@/components/composite';

export function Tokens() {
  const { address } = useAccount();
  const { data: tokens = [], isLoading, isFetching } = useTokens(address);
  const claimPrize = useClaimPrize();
  const [isClaimingPrize, setIsClaimingPrize] = useState(false);
  const [showCompositeDialog, setShowCompositeDialog] = useState(false);
  const [selectedPair, setSelectedPair] = useState<{
    source: number;
    target: number;
  } | null>(null);

  const handleClaimPrize = async (tokenId: number) => {
    try {
      setIsClaimingPrize(true);
      await claimPrize(tokenId);
      // Success state will be handled by the query invalidation
    } catch (error) {
      console.error('Failed to claim prize:', error);
      // You could add a toast notification here for the error
      toast.error('Failed to claim prize');
    } finally {
      setIsClaimingPrize(false);
    }
  };

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

    // Only show dialog if both tokens have the same arrows count
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
    return (
      <div className="relative p-4">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-green-500 mb-2">
            {`🎉 Congratulations! You've Won! 🎉`}
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            You have a winning arrow! Claim your prize now.
          </p>
        </div>
        <div className="max-w-sm mx-auto">
          <Token
            key={`token-${winningToken.id}`}
            token={winningToken}
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

  const sourceToken = selectedPair
    ? tokens.find((t) => t.id === selectedPair.source)
    : null;
  const targetToken = selectedPair
    ? tokens.find((t) => t.id === selectedPair.target)
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

      <Dialog open={showCompositeDialog} onOpenChange={setShowCompositeDialog}>
        <DialogContent className="bg-black border-green-500/20 shadow-2xl !max-w-[425px] !h-[695px] !rounded-none flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center">
            <DialogHeader className="text-center">
              <DialogTitle className="text-white text-2xl mb-2">
                Composite Arrows
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to composite these arrows together?
              </DialogDescription>
            </DialogHeader>

            {sourceToken && targetToken && (
              <div className="grid grid-cols-2 gap-8 py-8 px-4 w-full max-w-md">
                <div className="text-center source-arrow-container">
                  <p className="text-sm text-gray-400 mb-4">Keep</p>
                  <div className="relative">
                    <div className="absolute -inset-2 bg-green-500/20 rounded-xl blur-xl animate-pulse" />
                    <div className="absolute -inset-4 bg-green-500/10 rounded-2xl blur-2xl animate-pulse-slow" />
                    <Token token={sourceToken} onSelect={() => {}} />
                  </div>
                </div>
                <div className="text-center target-arrow-container">
                  <p className="text-sm text-gray-400 mb-4">Burn</p>
                  <div className="relative">
                    <div className="absolute -inset-2 bg-red-500/20 rounded-xl blur-xl animate-pulse" />
                    <div className="absolute -inset-4 bg-red-500/10 rounded-2xl blur-2xl animate-pulse-slow" />
                    <Token token={targetToken} onSelect={() => {}} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-800">
            <Button
              variant="outline"
              onClick={() => {
                setShowCompositeDialog(false);
                setSelectedPair(null);
              }}
              className="text-white border-gray-700 hover:bg-gray-900"
            >
              Cancel
            </Button>
            <Composite
              selectedTokens={
                selectedPair ? [selectedPair.source, selectedPair.target] : []
              }
              onCompositeComplete={handleCompositeComplete}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
