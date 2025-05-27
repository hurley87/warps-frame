'use client';

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { WARPS_CONTRACT, PAYMENT_TOKEN_CONTRACT } from '@/lib/contracts';
import { toast } from 'sonner';
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { awardPoints } from '@/lib/points';

interface MintProps {
  username: string;
}

export function Mint({ username }: MintProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const [isApproving, setIsApproving] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // Read mint price from contract
  const { data: mintPrice } = useReadContract({
    address: WARPS_CONTRACT.address,
    abi: WARPS_CONTRACT.abi,
    functionName: 'mintPrice',
  });

  // Read user's token balance
  const { data: tokenBalance } = useReadContract({
    address: PAYMENT_TOKEN_CONTRACT.address,
    abi: PAYMENT_TOKEN_CONTRACT.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  console.log('tokenBalance', tokenBalance);

  // Read current allowance
  const { data: currentAllowance } = useReadContract({
    address: PAYMENT_TOKEN_CONTRACT.address,
    abi: PAYMENT_TOKEN_CONTRACT.abi,
    functionName: 'allowance',
    args: address ? [address, WARPS_CONTRACT.address] : undefined,
  });

  console.log('currentAllowance', currentAllowance);

  // Write contract hooks
  const {
    data: approveHash,
    writeContract: approve,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const {
    data: mintHash,
    writeContract: mint,
    isPending: isMintPending,
    error: mintError,
  } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { isLoading: isMintLoading, isSuccess: isMintSuccess } =
    useWaitForTransactionReceipt({
      hash: mintHash,
    });

  // Check if user has sufficient balance and allowance
  const hasInsufficientBalance =
    tokenBalance !== undefined &&
    mintPrice !== undefined &&
    tokenBalance < mintPrice;
  const needsApproval =
    currentAllowance !== undefined &&
    mintPrice !== undefined &&
    currentAllowance < mintPrice;

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess) {
      setIsApproving(false);
      toast.success('Approval successful! You can now mint.', {
        icon: <CheckCircle className="h-4 w-4 text-green-400" />,
      });
      // Invalidate allowance query to refetch
      queryClient.invalidateQueries({
        queryKey: ['readContract', PAYMENT_TOKEN_CONTRACT.address, 'allowance'],
      });
    }
  }, [isApproveSuccess, queryClient]);

  // Handle mint success
  useEffect(() => {
    if (isMintSuccess) {
      setIsMinting(false);
      triggerScreenShake();

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['tokens-balance'] });
      queryClient.invalidateQueries({
        queryKey: ['readContract', WARPS_CONTRACT.address, 'hasUsedFreeMint'],
      });

      // Award points
      awardPoints({
        username,
        points: 10,
        reason: 'mint',
      }).catch((error) => {
        console.error('Failed to award points:', error);
      });

      toast.success('NFT minted successfully!', {
        icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
        className: 'bg-gradient-to-r from-primary/30 to-primary/10',
      });
    }
  }, [isMintSuccess, queryClient, username]);

  // Handle errors
  useEffect(() => {
    if (approveError) {
      setIsApproving(false);
      toast.error(`Approval failed: ${approveError.message}`);
    }
  }, [approveError]);

  useEffect(() => {
    if (mintError) {
      setIsMinting(false);
      toast.error(`Minting failed: ${mintError.message}`);
    }
  }, [mintError]);

  const triggerScreenShake = () => {
    document.documentElement.classList.add('screen-shake');
    setTimeout(() => {
      document.documentElement.classList.remove('screen-shake');
    }, 500);
  };

  const handleApprove = async () => {
    if (!address || !mintPrice) return;

    setIsApproving(true);
    try {
      approve({
        address: PAYMENT_TOKEN_CONTRACT.address,
        abi: PAYMENT_TOKEN_CONTRACT.abi,
        functionName: 'approve',
        args: [WARPS_CONTRACT.address, mintPrice],
      });
    } catch (error) {
      console.error('Approval error:', error);
      setIsApproving(false);
    }
  };

  const handleMint = async () => {
    if (!address) return;

    setIsMinting(true);
    try {
      mint({
        address: WARPS_CONTRACT.address,
        abi: WARPS_CONTRACT.abi,
        functionName: 'mint',
        args: [address],
      });
    } catch (error) {
      console.error('Minting error:', error);
      setIsMinting(false);
    }
  };

  if (!address) {
    return (
      <Button
        className="relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full bg-gray-500 cursor-not-allowed font-bold"
        disabled
      >
        Connect Wallet to Mint
      </Button>
    );
  }

  if (hasInsufficientBalance) {
    return (
      <Button
        className="relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full bg-red-500 cursor-not-allowed font-bold"
        disabled
      >
        Insufficient Balance
      </Button>
    );
  }

  if (needsApproval) {
    return (
      <Button
        className={`relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer bg-[#7c65c1] shadow-lg shadow-primary/20 hover:bg-[#7c65c1]/90 font-bold ${
          isApproving || isApprovePending || isApproveLoading
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
        onClick={handleApprove}
        disabled={isApproving || isApprovePending || isApproveLoading}
      >
        {isApproving || isApprovePending || isApproveLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Approving...
          </div>
        ) : (
          `Approve To Mint`
        )}
      </Button>
    );
  }

  return (
    <Button
      className={`relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer bg-[#7c65c1] shadow-lg shadow-primary/20 hover:bg-[#7c65c1]/90 font-bold ${
        isMinting || isMintPending || isMintLoading
          ? 'opacity-50 cursor-not-allowed'
          : ''
      }`}
      onClick={handleMint}
      disabled={isMinting || isMintPending || isMintLoading}
    >
      {isMinting || isMintPending || isMintLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Minting...
        </div>
      ) : (
        `Mint Warps`
      )}
    </Button>
  );
}
