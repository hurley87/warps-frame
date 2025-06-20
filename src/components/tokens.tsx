'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAccount, useReadContract } from 'wagmi';
import { useInfiniteTokens } from '@/hooks/use-tokens';
import { Token } from '@/components/token';
import { ClaimPrize } from '@/components/claim-prize';
import { CompositeDialog } from '@/components/composite-dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatedWarp } from './animated-warp';
import sdk from '@farcaster/frame-sdk';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';

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

export function Tokens({ username }: { username?: string }) {
  const { address } = useAccount();
  const [showClaimPrize, setShowClaimPrize] = useState(true);
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

  const { data: hasUsedFreeMint } = useReadContract({
    ...WARPS_CONTRACT,
    functionName: 'hasUsedFreeMint',
    args: [address!],
    chainId: chain.id,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  // Reset the evolved token highlight after a delay
  useEffect(() => {
    if (evolvedTokenId !== null) {
      const timer = setTimeout(() => {
        setEvolvedTokenId(null);
      }, 12000); // Highlight for 12 seconds so it remains after fetching overlay

      return () => clearTimeout(timer);
    }
  }, [evolvedTokenId]);

  const handleTokenSelect = (tokenId: number) => {
    // Find the token being selected
    const tokenToSelect = tokens.find((t) => t.id === tokenId);
    if (!tokenToSelect) return;

    // Check if the token has a single warp
    const warps = tokenToSelect.attributes.find(
      (attr) => attr.trait_type === 'Warps'
    )?.value;
    if (warps === '1') {
      toast.error('Cannot select a token with a single warp');
      return;
    }

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
    // Close dialog & reset selection states
    setShowCompositeDialog(false);
    setSelectedPair(null);
    setSelectedTokenId(null);

    // If we have an evolved token ID, highlight it and refresh data
    if (newEvolvedTokenId) {
      setEvolvedTokenId(newEvolvedTokenId);

      // Force refetch tokens to update UI and wait for completion
      Promise.all([
        queryClient.refetchQueries({ queryKey: ['tokens-balance'] }),
        queryClient.refetchQueries({ queryKey: ['tokens-metadata'] }),
      ]);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if user has any winning tokens
  const winningToken = tokens.find((token) => token.isWinning);

  if (winningToken && showClaimPrize) {
    return (
      <ClaimPrize
        token={winningToken}
        username={username}
        onClose={() => setShowClaimPrize(false)}
      />
    );
  }

  const sourceToken = selectedPair
    ? tokens.find((t) => t.id === selectedPair.source) ?? null
    : null;
  const targetToken = selectedPair
    ? tokens.find((t) => t.id === selectedPair.target) ?? null
    : null;

  const handleShareToWarpcast = async () => {
    const shareText = `@hurls can I have some warps?`;
    const warpcastUrl = `https://farcaster.xyz/~/compose?text=${encodeURIComponent(
      shareText
    )}`;
    sdk.actions.openUrl(warpcastUrl);
  };

  const handleShare = () => {
    if (!username) return;

    const shareText = 'Play Warps, Earn USDC!';
    const shareUrl = encodeURIComponent(`https://warps.fun?ref=${username}`);
    const warpcastUrl = `https://farcaster.xyz/~/compose?text=${encodeURIComponent(
      shareText
    )}&embeds[]=${shareUrl}`;

    sdk.actions.openUrl(warpcastUrl);
  };

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-6 space-y-6 text-center pt-0">
        <div className="relative w-64 h-64 flex items-center justify-center mb-4 mt-10">
          <AnimatedWarp className="w-54 h-54 mx-auto" />
        </div>

        <div className="space-y-3 max-w-xs">
          <p className="text-muted-foreground text-4xl font-bold">
            Mint and combine warps to win
          </p>
        </div>
        {!hasUsedFreeMint && (
          <Button
            onClick={handleShareToWarpcast}
            className="relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer
              bg-[#7c65c1] shadow-lg shadow-primary/20 hover:bg-[#7c65c1]/90 font-bold"
          >
            Claim Free Warps
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative p-4 pb-8 bg-[#17101f] overflow-hidden pt-0">
      {isFetching && <LoadingScreen />}

      <Button
        onClick={handleShare}
        className="border border-white rounded-lg text-black font-bold bg-white hover:bg-white/80 w-full mb-4"
      >
        Share & Earn Points
      </Button>

      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          {[...tokens]
            .sort((a, b) => b.id - a.id)
            .map((token) => (
              <div
                className={`border-2 ${
                  token.attributes.find((attr) => attr.trait_type === 'Warps')
                    ?.value === '1'
                    ? 'border-transparent'
                    : token.id === selectedTokenId
                    ? 'border-purple-500'
                    : 'border-purple-500/20'
                } rounded-md`}
                key={`token-${token.id}`}
              >
                <Token
                  key={`token-${token.id}`}
                  token={token}
                  onSelect={handleTokenSelect}
                  isBurnToken={
                    selectedPair?.target === token.id ||
                    (selectedTokenId !== null &&
                      selectedTokenId !== token.id &&
                      evolvedTokenId !== token.id)
                  }
                  isEvolvedToken={evolvedTokenId === token.id}
                />
                {token.attributes.find((attr) => attr.trait_type === 'Warps')
                  ?.value !== '1' && (
                  <button
                    className={`w-full rounded-b-md p-2 transition-all duration-200 ${
                      selectedTokenId === token.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                    }`}
                    onClick={() => handleTokenSelect(token.id)}
                  >
                    {selectedTokenId === token.id ? 'Selected' : 'Select'}
                  </button>
                )}
              </div>
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
        username={username}
      />
    </div>
  );
}
