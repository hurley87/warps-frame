'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Token } from '@/components/token';
import { toast } from 'sonner';
import { WARPS_CONTRACT, PAYMENT_TOKEN_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';
import sdk from '@farcaster/frame-sdk';
import { awardPoints } from '@/lib/points';
import { formatUnits } from 'viem';

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
  onClose: () => void;
}

export function ClaimPrize({ token, username, onClose }: ClaimPrizeProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClaimSuccessful, setIsClaimSuccessful] = useState(false);
  const [hasWonToday, setHasWonToday] = useState(false);
  const successHandled = useRef(false); // Prevent duplicate success handling

  // Add read contract hook to check available prize pool
  const { data: availablePrizePool } = useReadContract({
    ...WARPS_CONTRACT,
    functionName: 'getAvailablePrizePool',
    chainId: chain.id,
  });

  // Fetch the winner claim percentage
  const { data: winnerClaimPercentage } = useReadContract({
    ...WARPS_CONTRACT,
    functionName: 'winnerClaimPercentage',
    chainId: chain.id,
  });

  // Fetch the payment token decimals
  const { data: tokenDecimals } = useReadContract({
    ...PAYMENT_TOKEN_CONTRACT,
    functionName: 'decimals',
    chainId: chain.id,
  });

  // Fetch the payment token symbol
  const { data: tokenSymbol } = useReadContract({
    ...PAYMENT_TOKEN_CONTRACT,
    functionName: 'symbol',
    chainId: chain.id,
  });

  // Check if user has already won today
  useEffect(() => {
    const checkTodayPoints = async () => {
      if (!username) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      try {
        const response = await fetch('/api/points/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            reason: 'win',
            startDate: today.toISOString(),
            endDate: tomorrow.toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to check points');
        }

        const data = await response.json();
        setHasWonToday(data.hasPoints);
      } catch (error) {
        console.error("Error checking today's points:", error);
      }
    };

    checkTodayPoints();
  }, [username]);

  const formatHumanReadable = (value: bigint, decimals: number): string => {
    // Convert to a decimal string with proper precision
    const rawString = formatUnits(value, decimals);

    // Parse as float and format with commas and 2 decimal places
    const number = parseFloat(rawString);
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Calculate the actual prize amount based on the percentage
  const calculatePrizeAmount = (pool: bigint, percentage: number): bigint => {
    if (!pool || !percentage) return BigInt(0);
    return (pool * BigInt(percentage)) / BigInt(100);
  };

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

    // Check if there are rewards available
    if (availablePrizePool === BigInt(0)) {
      toast.error(
        'No rewards available in the prize pool. They are added once a day.'
      );
      return;
    }

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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-purple-900/50 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-white" />
        </button>
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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-purple-900/50 transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6 text-white" />
      </button>
      {/* Central content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm mx-auto">
        <div className="text-center p-4">
          <h2 className="text-4xl font-bold text-white mb-2">
            {hasWonToday
              ? 'You have already claimed your prize today! Come back tomorrow.'
              : availablePrizePool === BigInt(0)
              ? 'No rewards available at the moment. Please try again later!'
              : `Hurray! Try to claim ${formatHumanReadable(
                  calculatePrizeAmount(
                    availablePrizePool || BigInt(0),
                    Number(winnerClaimPercentage || 0)
                  ),
                  tokenDecimals || 18
                )} ${tokenSymbol || ''} before someone else does.`}
          </h2>
        </div>

        <Token key={`token-${token.id}`} token={token} onSelect={() => {}} />
      </div>

      {/* Fixed footer with claim button */}
      <footer className="fixed bottom-0 left-0 right-0 bg-purple-900 p-4 py-8 z-20 backdrop-blur-sm">
        <Button
          className={`relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full rounded-md shadow-lg ${
            isLoading || availablePrizePool === BigInt(0) || hasWonToday
              ? 'opacity-60 cursor-not-allowed bg-[#7c65c1]/60'
              : 'bg-[#7c65c1]/80 hover:bg-[#7c65c1]/90'
          }`}
          onClick={() => handleClaimPrize(token.id)}
          disabled={
            isLoading || availablePrizePool === BigInt(0) || hasWonToday
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isConfirming ? 'Confirming...' : 'Claiming...'}
            </>
          ) : hasWonToday ? (
            'Already Claimed Today'
          ) : availablePrizePool === BigInt(0) ? (
            'No Rewards Available'
          ) : (
            'Claim Prize 🏆'
          )}
        </Button>
      </footer>
    </div>
  );
}
