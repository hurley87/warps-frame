'use client';

import { useAccount } from 'wagmi';
import { Mint } from '@/components/mint';
import { FreeMint } from '@/components/free-mint';
import { useReadContract } from 'wagmi';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';

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

  return (
    <div className="w-full max-w-md mx-auto">
      {!hasUsedFreeMint ? <FreeMint /> : <Mint username={username} />}
    </div>
  );
}
