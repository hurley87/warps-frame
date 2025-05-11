'use client';

import { useState, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import posthog from 'posthog-js';

export function FreeMint() {
  const { address } = useAccount();
  const { signMessage } = useSignMessage();
  const queryClient = useQueryClient();

  const [isFreeMinting, setIsFreeMinting] = useState(false);
  const [hasError, setHasError] = useState(false);

  // State reset needed after success animation
  const successHandled = useRef(false);

  const handleFreeMint = async () => {
    if (!address) return;

    setIsFreeMinting(true);
    setHasError(false);
    successHandled.current = false;

    try {
      const timestamp = Date.now();
      const message = `Free mint request for ${address} at ${timestamp}`;
      const signature = await signMessage({ message });

      const response = await fetch('/api/public/free-mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          signature,
          timestamp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to claim free mint');
      }

      setIsFreeMinting(false);
      triggerScreenShake();

      // Refresh both token queries to ensure UI updates
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['tokens-balance'] }),
        queryClient.refetchQueries({ queryKey: ['tokens-metadata'] }),
      ]);

      toast.success('Successfully claimed free mint!', {
        icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
        className: 'bg-gradient-to-r from-primary/30 to-primary/10',
      });

      posthog.capture('free_mint', {
        address,
      });
    } catch (error) {
      console.error('Free mint error:', error);
      setHasError(true);
      setIsFreeMinting(false);
    }
  };

  const triggerScreenShake = () => {
    document.documentElement.classList.add('screen-shake');
    setTimeout(() => {
      document.documentElement.classList.remove('screen-shake');
    }, 500);
  };

  if (hasError) {
    return (
      <Button
        className="relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer bg-red-500"
        onClick={handleFreeMint}
      >
        {isFreeMinting ? 'Claiming...' : 'Retry'}
      </Button>
    );
  }

  return (
    <Button
      className={`relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer bg-[#7c65c1] shadow-lg shadow-primary/20 hover:bg-[#7c65c1]/90 font-bold ${
        isFreeMinting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={handleFreeMint}
    >
      {isFreeMinting ? 'Claiming...' : 'Claim Free Warps'}
    </Button>
  );
}
