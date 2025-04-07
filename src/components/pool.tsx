import { useBalance } from 'wagmi';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { formatEther } from 'viem';

export function Pool({ showLabel = false }: { showLabel?: boolean }) {
  const { data: balance, isLoading } = useBalance({
    address: ARROWS_CONTRACT.address,
  });

  const sixtyPercent = balance
    ? (balance.value * BigInt(60)) / BigInt(100)
    : BigInt(0);
  const formattedAmount = isLoading ? (
    <span className="animate-pulse">Loading...</span>
  ) : (
    `${formatEther(sixtyPercent)} ETH`
  );

  if (showLabel) {
    return (
      <div className="space-y-2">
        <h3 className="font-bold">60% of Contract Balance</h3>
        <p>{formattedAmount}</p>
      </div>
    );
  }

  return <>{formattedAmount}</>;
}
