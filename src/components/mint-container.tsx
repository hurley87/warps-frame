'use client';

import { Mint } from './mint';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';
import { Button } from './ui/button';
import sdk from '@farcaster/frame-sdk';

interface MintContainerProps {
  username: string;
}

export function MintContainer({ username }: MintContainerProps) {
  const { address } = useAccount();

  const { data: hasUsedFreeMint } = useReadContract({
    ...WARPS_CONTRACT,
    functionName: 'hasUsedFreeMint',
    args: [address!],
    chainId: chain.id,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const handleShareToWarpcast = async () => {
    const shareText = `@hurls can I have some warps?`;
    const warpcastUrl = `https://farcaster.xyz/~/compose?text=${encodeURIComponent(
      shareText
    )}`;
    sdk.actions.openUrl(warpcastUrl);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      {!hasUsedFreeMint && (
        <Button
          onClick={handleShareToWarpcast}
          className="relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full cursor-pointer
            bg-[#7c65c1] shadow-lg shadow-primary/20 hover:bg-[#7c65c1]/90 font-bold"
        >
          Claim Free Warps
        </Button>
      )}
      <Mint username={username} />
    </div>
  );
}
