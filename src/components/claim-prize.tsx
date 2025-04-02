'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Token } from '@/components/token';
import { toast } from 'sonner';
import { useClaimPrize } from '@/hooks/use-tokens';

interface ClaimPrizeProps {
  token: {
    id: number;
    name: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
    isWinning?: boolean;
  };
}

export function ClaimPrize({ token }: ClaimPrizeProps) {
  const claimPrize = useClaimPrize();
  const [isClaimingPrize, setIsClaimingPrize] = useState(false);

  const handleClaimPrize = async (tokenId: number) => {
    console.log('handleClaimPrize', tokenId);
    try {
      setIsClaimingPrize(true);
      await claimPrize(tokenId);
      // Success state will be handled by the query invalidation
    } catch (error) {
      console.error('Failed to claim prize:', error);
      toast.error('Failed to claim prize');
    } finally {
      setIsClaimingPrize(false);
    }
  };

  return (
    <div className="relative p-4">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-bold text-green-500 mb-2">
          {`🎉 Congratulations! You've Won! 🎉`}
        </h2>
        <p className="text-lg text-muted-foreground mb-4">
          You have a winning arrow! Claim your prize now.
        </p>
      </div>
      <div className="max-w-sm mx-auto">
        <Token key={`token-${token.id}`} token={token} onSelect={() => {}} />
        <Button
          className="w-full mt-4 bg-green-500 hover:bg-green-600"
          onClick={() => handleClaimPrize(token.id)}
          disabled={isClaimingPrize}
        >
          {isClaimingPrize ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Claiming Prize...
            </>
          ) : (
            'Claim Prize 🏆'
          )}
        </Button>
      </div>
    </div>
  );
}
