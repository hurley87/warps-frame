'use client';

import { encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { useState } from 'react';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import { DaimoPayButton } from '@daimo/pay';
import { useRouter } from 'next/navigation';

export function Mint() {
  const { address } = useAccount();
  const router = useRouter();

  const [hasError, setHasError] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'started' | 'completed' | 'bounced'
  >('idle');

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

  return (
    <DaimoPayButton.Custom
      appId={process.env.NEXT_PUBLIC_DAIMO_APP_ID!}
      toAddress={
        '0x2B48D8EB7f6CC235ee6C9e5de9191c19421fCF0A'.toLowerCase() as `0x${string}`
      }
      toChain={8453}
      toUnits={'4.00'}
      toToken={'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'}
      intent="Purchase NFT"
      toCallData={encodeFunctionData({
        abi: WARPS_CONTRACT.abi,
        functionName: 'mint',
        args: [address as `0x${string}`],
      })}
      onPaymentStarted={(e) => {
        console.log('Payment started:', e);
        setIsPaymentProcessing(true);
        setPaymentStatus('started');
        setHasError(false);
        toast.info('Payment initiated...', {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });
      }}
      onPaymentCompleted={(e) => {
        console.log('Payment completed:', e);
        setIsPaymentProcessing(false);
        setPaymentStatus('completed');
        setHasError(false);
        triggerScreenShake();

        // Invalidate relevant queries
        router.push('/thanks');
        toast.success('Payment successful! NFT minted!', {
          icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
          className: 'bg-gradient-to-r from-primary/30 to-primary/10',
        });
      }}
      onPaymentBounced={(e) => {
        console.log('Payment bounced:', e);
        setIsPaymentProcessing(false);
        setPaymentStatus('bounced');
        setHasError(true);
        playErrorFeedback();
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
              : paymentStatus === 'completed'
              ? 'bg-green-500 hover:bg-green-600'
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
          ) : paymentStatus === 'completed' ? (
            'Mint Successful!'
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
