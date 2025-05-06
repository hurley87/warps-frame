'use client';

// import { useAccount } from 'wagmi';
// import { Mint } from '@/components/mint';
// import { FreeMint } from '@/components/free-mint';
// import { useReadContract } from 'wagmi';
// import { WARPS_CONTRACT } from '@/lib/contracts';
// import { chain } from '@/lib/chain';

interface MintContainerProps {
  username: string;
}

export function MintContainer({ username }: MintContainerProps) {
  console.log('username', username);
  // const { address } = useAccount();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* {!hasUsedFreeMint ? <FreeMint /> : <Mint username={username} />} */}
      Game coming soon!
    </div>
  );
}
