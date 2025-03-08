import { useReadContract } from 'wagmi';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { formatEther } from 'viem';

export function Pool() {
  const { data: winnerShare, isLoading } = useReadContract({
    address: ARROWS_CONTRACT.address,
    abi: ARROWS_CONTRACT.abi,
    functionName: 'getWinnerShare',
  });

  console.log('winnerShare', winnerShare);

  return (
    <div className="bg-secondary/30 backdrop-blur-sm rounded-xl p-4 text-white">
      <h4 className="text-sm font-medium mb-2 text-center">Prize Pool</h4>
      <div className="flex items-center justify-center gap-2">
        <span className="text-xl font-bold">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            `${formatEther(winnerShare || BigInt(0))} ETH`
          )}
        </span>
      </div>
    </div>
  );
}
