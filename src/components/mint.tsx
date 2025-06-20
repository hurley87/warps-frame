'use client';

import { encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { useState } from 'react';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import { DaimoPayButton } from '@daimo/pay';
import { useQueryClient } from '@tanstack/react-query';
import { awardPoints } from '@/lib/points';

interface MintProps {
  username: string;
}

export function Mint({ username }: MintProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const [hasError, setHasError] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const triggerScreenShake = () => {
    document.documentElement.classList.add('screen-shake');
    setTimeout(() => {
      document.documentElement.classList.remove('screen-shake');
    }, 500);
  };

  const handlePaymentCompleted = async () => {
    setIsPaymentProcessing(false);
    setHasError(false);
    triggerScreenShake();

    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['tokens-balance'] });
    queryClient.invalidateQueries({
      queryKey: ['readContract', WARPS_CONTRACT.address, 'hasUsedFreeMint'],
    });

    try {
      await awardPoints({
        username,
        points: 10,
        reason: 'mint',
      });
      toast.success('Payment successful! NFT minted!', {
        icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
        className: 'bg-gradient-to-r from-primary/30 to-primary/10',
      });
    } catch (error) {
      console.error('Failed to award points:', error);
      // Still show success for the mint, but log the points error
      toast.success('Payment successful! NFT minted! (Points award failed)', {
        icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
        className: 'bg-gradient-to-r from-primary/30 to-primary/10',
      });
    }
  };

  return (
    <DaimoPayButton.Custom
      appId={process.env.NEXT_PUBLIC_DAIMO_APP_ID!}
      toAddress={
        '0xd59dfec75ffd9100334eb8635305a9b2a88f145a'.toLowerCase() as `0x${string}`
      }
      toChain={8453}
      toUnits={'500000'}
      toToken={'0x32E0f9d26D1e33625742A52620cC76C1130efde6'}
      intent="Purchase NFT"
      toCallData={encodeFunctionData({
        abi: WARPS_CONTRACT.abi,
        functionName: 'mint',
        args: [address as `0x${string}`],
      })}
      onPaymentStarted={(e) => {
        console.log('Payment started:', e);
        setIsPaymentProcessing(true);
        setHasError(false);
        toast.info('Payment initiated...', {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });
      }}
      onPaymentCompleted={handlePaymentCompleted}
      resetOnSuccess
      onPaymentBounced={(e) => {
        console.log('Payment bounced:', e);
        setIsPaymentProcessing(false);
        setHasError(true);
        toast.error('Payment failed. Please try again.', {
          icon: '❌',
        });
      }}
    >
      {({ show }) => (
        <Button
          className={`relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer ${
            hasError
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-[#7c65c1] shadow-lg shadow-primary/20 hover:bg-[#7c65c1]/90'
          } font-bold ${
            isPaymentProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={show}
          disabled={isPaymentProcessing}
        >
          {isPaymentProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : hasError ? (
            'Retry Payment'
          ) : (
            `Mint Warps`
          )}
        </Button>
      )}
    </DaimoPayButton.Custom>
  );
}
