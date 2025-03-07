'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';

export function Mint() {
  const { address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const queryClient = useQueryClient();

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for successful transactions and invalidate the tokens query
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
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
    } finally {
      setIsMinting(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to mint
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button
        onClick={handleMint}
        disabled={isMinting || isConfirming}
        className="w-full max-w-xs"
      >
        {isMinting || isConfirming ? 'Minting...' : 'Mint 10 Arrows'}
      </Button>

      {isSuccess && (
        <div className="text-green-600 dark:text-green-400">
          Successfully minted!{' '}
          <a
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on BaseScan
          </a>
        </div>
      )}
    </div>
  );
}
