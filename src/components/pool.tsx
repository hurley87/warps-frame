import { useReadContract } from 'wagmi';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { formatEther } from 'viem';

export function Pool({ showLabel = false }: { showLabel?: boolean }) {
  const { data: winnerShare, isLoading } = useReadContract({
    address: ARROWS_CONTRACT.address,
    abi: ARROWS_CONTRACT.abi,
    functionName: 'getWinnerShare',
  });

  const formattedAmount = isLoading ? (
    <span className="animate-pulse">Loading...</span>
  ) : (
    `${formatEther(winnerShare || BigInt(0))} ETH`
  );

  if (showLabel) {
    return (
      <div className="space-y-2">
        <h3 className="font-bold">Prize Pool</h3>
        <p>{formattedAmount}</p>
      </div>
    );
  }

  return <>{formattedAmount}</>;
}
