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
  onCompositeComplete: (evolvedTokenId?: number) => void;
}

export function Composite({
  selectedTokens,
  onCompositeComplete,
}: CompositeProps) {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const successHandled = useRef(false);

  const { data: hash, writeContract } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const handleSuccess = async () => {
      if (isSuccess && !successHandled.current && receipt) {
        successHandled.current = true;

        // Get the evolved token ID (which is the first token in the selectedTokens array)
        const evolvedTokenId = selectedTokens[0];

        // Invalidate the tokens query to refresh the data
        await queryClient.invalidateQueries({ queryKey: ['tokens'] });

        // Pass the evolved token ID back to the parent component
        onCompositeComplete(evolvedTokenId);

        setTimeout(() => {
          toast.success('Successfully evolved arrows!');
        }, 0);

        setIsPending(false);
      }
    };

    handleSuccess();
  }, [isSuccess, receipt, queryClient, onCompositeComplete, selectedTokens]);

  const handleComposite = async () => {
    if (!address || selectedTokens.length !== 2) return;

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
