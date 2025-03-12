'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function Mint() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Determine if any loading state is active
  const isLoading = isPending || isWritePending || isConfirming;

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Successfully minted 10 Arrows!');
      setIsPending(false);
    }
  }, [isSuccess, queryClient]);

  const handleMint = async () => {
    if (!address) return;

    setIsPending(true);
    try {
      await writeContract({
        ...ARROWS_CONTRACT,
        functionName: 'mint',
        args: [address],
        value: parseEther('0.01'), // 0.001 ETH * 10 tokens
      });
      // Note: We don't reset isPending here as we want to keep the loading state
      // until the transaction is confirmed (handled in the useEffect)
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('Failed to mint Arrows');
      setIsPending(false);
    }
  };

  return (
    <>
      <Button onClick={handleMint} disabled={isLoading} className="border">
        {isLoading ? 'Minting...' : 'Mint Arrows'}
      </Button>
    </>
  );
}
