'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Token } from '@/components/token';
import { toast } from 'sonner';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';
import sdk from '@farcaster/frame-sdk';
import { Pool } from './pool';
import { awardPoints } from '@/lib/points';

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

        await awardPoints({
          username: username!,
          points: 20,
          reason: 'win',
        });

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
        gas: BigInt(5000000),
      });

      // Notification sent in the success handler
    } catch (error) {
      console.error('Error submitting claim prize transaction:', error);
      toast.error('Failed to submit claim prize transaction.');
      setIsProcessing(false);
    }
  };

  const handleShareToWarpcast = async () => {
    const shareText = `🏆 I just beat Warps! 🏆`;
    const shareUrl = 'https://warps.fun';
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      shareText
    )}&embeds[]=${shareUrl}`;
    sdk.actions.openUrl(warpcastUrl);
  };

  if (isClaimSuccessful) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#17101f] bottom-0 left-0 right-0 top-0">
        <div className="mb-6 text-center h-full justify-center flex items-center">
          <h2 className="text-4xl font-bold text-white mb-2">
            Share your win with your friends!
          </h2>
        </div>

        <div className="w-full mx-auto bg-purple-900 p-4 py-8 z-20 backdrop-blur-sm">
          <Button
            className="relative group overflow-hidden transition-all duration-300 py-10 text-2xl font-bold w-full mt-4 bg-[#7c65c1]/80 hover:bg-[#7c65c1]/90 rounded-md shadow-lg"
            onClick={handleShareToWarpcast}
          >
            Share Your Win
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#17101f] bottom-0 left-0 right-0 top-0">
      {/* Central content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm mx-auto">
        <div className="text-center p-4">
          <h2 className="text-4xl font-bold text-white mb-2">
            {`Hurray! Try to claim `} <Pool showWinningAmount={true} /> before
            someone else does.
          </h2>
        </div>

        <Token key={`token-${token.id}`} token={token} onSelect={() => {}} />
      </div>

      {/* Fixed footer with claim button */}
      <footer className="fixed bottom-0 left-0 right-0 bg-purple-900 p-4 py-8 z-20 backdrop-blur-sm">
        <Button
          className={`relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full rounded-md shadow-lg ${
            isLoading
              ? 'opacity-60 cursor-not-allowed bg-[#7c65c1]/60'
              : 'bg-[#7c65c1]/80 hover:bg-[#7c65c1]/90'
          }`}
          onClick={() => handleClaimPrize(token.id)}
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
      </footer>
    </div>
  );
}
