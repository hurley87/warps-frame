'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ensureBaseNetwork } from '@/lib/network';
import { useNetworkCheck } from '@/hooks/use-network-check';

export function Mint() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const { isCorrectNetwork, switchToBaseNetwork, isSwitchingNetwork } =
    useNetworkCheck();

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Determine if any loading state is active
  const isLoading =
    isPending || isWritePending || isConfirming || isSwitchingNetwork;

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Successfully minted 10 Arrows!');
      setIsPending(false);
    }
  }, [isSuccess, queryClient]);

  const handleMint = async () => {
    if (!address) return;

    // Check if we're on the Base network first
    if (!isCorrectNetwork) {
      const switched = await ensureBaseNetwork();
      if (!switched) {
        toast.error('Please switch to Base network to mint arrows');
        return;
      }
    }

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

  // If not on the correct network, show a switch network button
  if (!isCorrectNetwork && address) {
    return (
      <Button
        onClick={switchToBaseNetwork}
        disabled={isSwitchingNetwork}
        variant="outline"
        className="border border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
      >
        {isSwitchingNetwork ? 'Switching...' : 'Switch to Base'}
      </Button>
    );
  }

  return (
    <Button onClick={handleMint} disabled={isLoading} className="border">
      {isLoading ? 'Minting...' : 'Mint Arrows'}
    </Button>
  );
}
