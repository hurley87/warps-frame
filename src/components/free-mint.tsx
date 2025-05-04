'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';
import posthog from 'posthog-js';

export function FreeMint() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const [isFreeMinting, setIsFreeMinting] = useState(false);
  const [isFreeMintTxMining, setIsFreeMintTxMining] = useState(false);
  const [freeMintTxHash, setFreeMintTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [freeMintTimeoutId, setFreeMintTimeoutId] =
    useState<NodeJS.Timeout | null>(null);
  const [hasError, setHasError] = useState(false);

  // State reset needed after success animation
  const successHandled = useRef(false);

  const { writeContract: freeMintWriteContract } = useWriteContract({
    mutation: {
      onMutate: () => {
        setIsFreeMinting(true);
        setHasError(false);

        // Clear any existing timeout
        if (freeMintTimeoutId) {
          clearTimeout(freeMintTimeoutId);
        }
        // Set new timeout
        const timeoutId = setTimeout(() => {
          if (isFreeMinting || isFreeMintTxMining) {
            setHasError(true);
            setIsFreeMinting(false);
            setIsFreeMintTxMining(false);
            playErrorFeedback();
          }
        }, 5000);
        setFreeMintTimeoutId(timeoutId);
      },
      onSuccess: (hash) => {
        setFreeMintTxHash(hash);
        setIsFreeMintTxMining(true);
        toast.info('Free mint transaction submitted...', {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });
        posthog.capture('free_mint', {
          address,
        });
      },
      onError: (error: Error) => {
        console.error('Free mint error:', error);
        setHasError(true);
        setIsFreeMinting(false);
        setIsFreeMintTxMining(false);
        playErrorFeedback();
        // Clear timeout on error
        if (freeMintTimeoutId) {
          clearTimeout(freeMintTimeoutId);
          setFreeMintTimeoutId(null);
        }
      },
    },
  });

  const { isSuccess: freeMintTxSuccess } = useWaitForTransactionReceipt({
    hash: freeMintTxHash,
    chainId: chain.id,
    query: {
      enabled: !!freeMintTxHash,
    },
  });

  useEffect(() => {
    const handleFreeMintSuccess = async () => {
      if (freeMintTxSuccess && !successHandled.current) {
        successHandled.current = true;
        setIsFreeMinting(false);
        setIsFreeMintTxMining(false);
        setHasError(false);

        // Clear timeout on success
        if (freeMintTimeoutId) {
          clearTimeout(freeMintTimeoutId);
          setFreeMintTimeoutId(null);
        }

        triggerScreenShake();

        // Refresh both token queries to ensure UI updates
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['tokens-balance'] }),
          queryClient.refetchQueries({ queryKey: ['tokens-metadata'] }),
        ]);

        toast.success('Successfully claimed free mint!', {
          icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
          className: 'bg-gradient-to-r from-primary/30 to-primary/10',
        });
      }
    };

    handleFreeMintSuccess();
  }, [freeMintTxSuccess, queryClient, freeMintTimeoutId]);

  const handleFreeMint = async () => {
    if (!address) return;

    successHandled.current = false;

    try {
      await freeMintWriteContract({
        ...WARPS_CONTRACT,
        functionName: 'freeMint',
        args: [address as `0x${string}`],
        chainId: chain.id,
        gas: BigInt(1000000),
      });
    } catch (error) {
      console.error('Handle free mint triggered catch:', error);
    }
  };

  const playErrorFeedback = () => {
    const errorSound = new Audio('/sounds/composite-error.mp3');
    errorSound.volume = 0.3;
    errorSound.play().catch(() => {});
    triggerScreenShake();
  };

  const triggerScreenShake = () => {
    document.documentElement.classList.add('screen-shake');
    setTimeout(() => {
      document.documentElement.classList.remove('screen-shake');
    }, 500);
  };

  if (hasError) {
    return (
      <Button
        className="relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer bg-red-500"
        onClick={handleFreeMint}
      >
        {isFreeMinting ? 'Claiming...' : 'Retry'}
      </Button>
    );
  }

  return (
    <Button
      className={`relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer bg-[#7c65c1] shadow-lg shadow-primary/20 hover:bg-[#7c65c1]/90 font-bold ${
        isFreeMinting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={handleFreeMint}
    >
      {isFreeMinting ? 'Claiming...' : 'Claim Free Warps'}
    </Button>
  );
}
