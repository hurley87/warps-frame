'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Token } from '@/components/token';
import { toast } from 'sonner';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';
import sdk from '@farcaster/frame-sdk';

interface ClaimPrizeProps {
  token: {
    id: number;
    name: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
    isWinning?: boolean;
  };
  username?: string;
}

export function ClaimPrize({ token, username }: ClaimPrizeProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClaimSuccessful, setIsClaimSuccessful] = useState(false);
  const successHandled = useRef(false); // Prevent duplicate success handling

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash,
      chainId: chain.id,
    });

  const isLoading = isProcessing || isWritePending || isConfirming;

  useEffect(() => {
    // Handle write errors
    if (writeError) {
      console.error('Failed to initiate prize claim:', writeError);
      toast.error('Failed to claim prize. Please try again.');
      setIsProcessing(false); // Reset processing state on error
    }
  }, [writeError]);

  useEffect(() => {
    // Handle transaction success
    const handleSuccess = async () => {
      if (isTxSuccess && !successHandled.current) {
        successHandled.current = true;
        toast.success('Prize Claimed Successfully! 🏆', {
          icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
        });

        // Remove query invalidation from here to prevent immediate navigation
        // and keep the success state visible

        // Notify all users about the winner
        try {
          const response = await fetch('/api/notify-users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              winnerTokenId: token.id,
              winnerAddress: username ? username : address,
            }),
          });

          if (!response.ok) {
            console.error(
              'Failed to send winner notifications:',
              await response.text()
            );
          }
        } catch (error) {
          console.error('Error sending winner notifications:', error);
        }

        setIsProcessing(false); // Reset processing state on success
        setIsClaimSuccessful(true); // Set claim as successful to show success UI
      }
    };

    handleSuccess();
  }, [isTxSuccess, queryClient, token.id, address, username]);

  const handleClaimPrize = async (tokenId: number) => {
    if (!address || isLoading) return;

    setIsProcessing(true);
    successHandled.current = false; // Reset success flag for new attempt

    try {
      writeContract({
        ...WARPS_CONTRACT,
        functionName: 'claimPrize',
        args: [BigInt(tokenId)],
        chainId: chain.id,
      });

      // Notification sent in the success handler
    } catch (error) {
      console.error('Error submitting claim prize transaction:', error);
      toast.error('Failed to submit claim prize transaction.');
      setIsProcessing(false);
    }
  };

  const handleShareToWarpcast = async () => {
    const shareText = `🏆 I just won with my Arrow on Warps! Check it out!`;
    const shareUrl = 'https://warps.fun';
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      shareText
    )}&embeds[]=${shareUrl}`;
    sdk.actions.openUrl(warpcastUrl);
  };

  const handleDone = async () => {
    // Now invalidate queries only when the user is done with the success state
    await queryClient.invalidateQueries({ queryKey: ['tokens-balance'] });
    await queryClient.invalidateQueries({ queryKey: ['tokens-metadata'] });

    // Navigate back or reset the state
    // window.history.back();
  };

  if (isClaimSuccessful) {
    return (
      <div className="relative p-4 bg-gradient-to-b from-[#7c65c1]/20 to-transparent rounded-xl">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-green-500 mb-2">
            {`🎉 Prize Claimed Successfully! 🎉`}
          </h2>
        </div>

        <div className="max-w-sm mx-auto">
          <Token key={`token-${token.id}`} token={token} onSelect={() => {}} />

          <Button
            className="w-full mt-4 bg-[#7c65c1] hover:bg-[#7c65c1]/90"
            onClick={handleShareToWarpcast}
            size="lg"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Your Win on Warpcast
          </Button>

          <Button
            className="w-full mt-2 variant-ghost"
            onClick={handleDone}
            variant="ghost"
            size="sm"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-4">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-bold text-green-500 mb-2">
          {`🎉 Congratulations! You've Won! 🎉`}
        </h2>
      </div>
      <div className="max-w-sm mx-auto">
        <Token key={`token-${token.id}`} token={token} onSelect={() => {}} />
        <Button
          className="w-full mt-4 bg-[#7c65c1] hover:bg-[#7c65c1]/90"
          onClick={() => handleClaimPrize(token.id)}
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isConfirming ? 'Confirming...' : 'Claiming...'}
            </>
          ) : (
            'Claim Prize 🏆'
          )}
        </Button>
      </div>
    </div>
  );
}
