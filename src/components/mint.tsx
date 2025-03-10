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
  const [isMinting, setIsMinting] = useState(false);
  const queryClient = useQueryClient();

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Successfully minted 10 Arrows!');
    }
  }, [isSuccess, queryClient]);

  const handleMint = async () => {
    if (!address) return;

    setIsMinting(true);
    try {
      await writeContract({
        ...ARROWS_CONTRACT,
        functionName: 'mint',
        args: [address],
        value: parseEther('0.01'), // 0.001 ETH * 10 tokens
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('Failed to mint Arrows');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Button
      onClick={handleMint}
      disabled={isMinting || isConfirming}
      className="w-full max-w-xs"
    >
      {isMinting || isConfirming ? 'Minting...' : 'Mint'}
    </Button>
  );
}
