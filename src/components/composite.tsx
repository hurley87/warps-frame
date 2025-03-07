'use client';

import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CompositeProps {
  selectedTokens: number[];
  onCompositeComplete: () => void;
}

export function Composite({
  selectedTokens,
  onCompositeComplete,
}: CompositeProps) {
  const { address } = useAccount();
  const [isCompositing, setIsCompositing] = useState(false);
  const queryClient = useQueryClient();
  const successHandled = useRef(false);

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle success state
  useEffect(() => {
    if (isSuccess && !successHandled.current) {
      successHandled.current = true;
      // Handle success synchronously
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      onCompositeComplete();
      // Schedule toast to next tick to avoid React state updates
      setTimeout(() => {
        toast.success('Successfully composited arrows!');
      }, 0);
    }
  }, [isSuccess, queryClient, onCompositeComplete]);

  const handleComposite = async () => {
    if (!address || selectedTokens.length !== 2) return;

    successHandled.current = false;
    setIsCompositing(true);
    try {
      await writeContract({
        ...ARROWS_CONTRACT,
        functionName: 'composite',
        args: [BigInt(selectedTokens[0]), BigInt(selectedTokens[1])],
      });
    } catch (error) {
      console.error('Composite error:', error);
      toast.error('Failed to composite arrows');
    } finally {
      setIsCompositing(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to composite arrows
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button
        onClick={handleComposite}
        disabled={isCompositing || isConfirming || selectedTokens.length !== 2}
        className="w-full max-w-xs"
      >
        {isCompositing || isConfirming
          ? 'Compositing...'
          : 'Composite Selected Arrows'}
      </Button>
      {selectedTokens.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Select two arrows to composite them together
        </p>
      )}
      {selectedTokens.length === 1 && (
        <p className="text-sm text-muted-foreground">
          Select one more arrow to composite
        </p>
      )}
    </div>
  );
}
