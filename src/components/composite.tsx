'use client';

import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ensureBaseNetwork } from '@/lib/network';
import { useNetworkCheck } from '@/hooks/use-network-check';

interface CompositeProps {
  selectedTokens: number[];
  onCompositeComplete: () => void;
}

export function Composite({
  selectedTokens,
  onCompositeComplete,
}: CompositeProps) {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const successHandled = useRef(false);
  const { isCorrectNetwork } = useNetworkCheck();

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && !successHandled.current) {
      successHandled.current = true;
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      onCompositeComplete();
      setTimeout(() => {
        toast.success('Successfully evolved arrows!');
      }, 0);
      setIsPending(false);
    }
  }, [isSuccess, queryClient, onCompositeComplete]);

  const handleComposite = async () => {
    if (!address || selectedTokens.length !== 2) return;

    // Check if we're on the Base network first
    if (!isCorrectNetwork) {
      const switched = await ensureBaseNetwork();
      if (!switched) {
        toast.error('Please switch to Base network to evolve arrows');
        return;
      }
    }

    successHandled.current = false;
    setIsPending(true);
    try {
      await writeContract({
        ...ARROWS_CONTRACT,
        functionName: 'composite',
        args: [BigInt(selectedTokens[0]), BigInt(selectedTokens[1])],
      });
    } catch (error) {
      console.error('Composite error:', error);
      toast.error('Failed to composite arrows');
      setIsPending(false);
    }
  };

  const isLoading = isConfirming || isPending;
  let buttonText = isPending && !hash ? 'Waiting for approval...' : 'Evolve';

  if (isLoading) {
    buttonText = 'Evolving...';
  }

  return (
    <Button
      onClick={handleComposite}
      disabled={isLoading || selectedTokens.length !== 2}
      className="border"
    >
      {buttonText}
    </Button>
  );
}
