import { useReadContract } from 'wagmi';
import { WARPS_CONTRACT, PAYMENT_TOKEN_CONTRACT } from '@/lib/contracts';
import { formatUnits } from 'viem';
import { chain } from '@/lib/chain';

export function Pool({
  showLabel = false,
  showWinningAmount = false,
}: {
  showLabel?: boolean;
  showWinningAmount?: boolean;
}) {
  // Fetch the total deposited amount in payment tokens
  const { data: totalDepositedData, isLoading: isDepositedLoading } =
    useReadContract({
      address: WARPS_CONTRACT.address,
      abi: WARPS_CONTRACT.abi,
      functionName: 'getTotalDeposited',
      chainId: chain.id,
      query: {
        refetchInterval: 30000, // Refetch every 30 seconds
      },
    });

  // Fetch the payment token decimals
  const { data: tokenDecimals, isLoading: isDecimalsLoading } = useReadContract(
    {
      address: PAYMENT_TOKEN_CONTRACT.address,
      abi: PAYMENT_TOKEN_CONTRACT.abi,
      functionName: 'decimals',
      chainId: chain.id,
    }
  );

  // Fetch the payment token symbol
  const { data: tokenSymbol, isLoading: isSymbolLoading } = useReadContract({
    address: PAYMENT_TOKEN_CONTRACT.address,
    abi: PAYMENT_TOKEN_CONTRACT.abi,
    functionName: 'symbol',
    chainId: chain.id,
  });

  // Fetch the winner claim percentage
  const { data: winnerClaimPercentage, isLoading: isPercentageLoading } =
    useReadContract({
      address: WARPS_CONTRACT.address,
      abi: WARPS_CONTRACT.abi,
      functionName: 'winnerClaimPercentage',
      chainId: chain.id,
    });

  // Format the total deposited amount
  const isLoading =
    isDepositedLoading ||
    isDecimalsLoading ||
    isSymbolLoading ||
    isPercentageLoading;

  const formatHumanReadable = (value: bigint, decimals: number): string => {
    // Convert to a decimal string with proper precision
    const rawString = formatUnits(value, decimals);

    // Parse as float and format with commas and 2 decimal places
    const number = parseFloat(rawString);
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(number);
  };

  const calculateWinningAmount = (
    total: bigint,
    percentage: number
  ): bigint => {
    if (!total || !percentage) return BigInt(0);
    return (total * BigInt(percentage)) / BigInt(100);
  };

  const formattedAmount = isLoading ? (
    <span className="animate-pulse">Loading...</span>
  ) : (
    `${formatHumanReadable(
      totalDepositedData || BigInt(0),
      tokenDecimals || 18
    )} ${tokenSymbol || ''}`
  );

  const winningAmount = calculateWinningAmount(
    totalDepositedData || BigInt(0),
    Number(winnerClaimPercentage || 60)
  );

  const formattedWinningAmount = isLoading ? (
    <span className="animate-pulse">Loading...</span>
  ) : (
    `${formatHumanReadable(winningAmount, tokenDecimals || 18)} ${
      tokenSymbol || ''
    }`
  );

  if (showLabel) {
    return (
      <div className="space-y-2">
        <h3 className="font-bold">Total Deposited</h3>
        <p>{formattedAmount}</p>
        {showWinningAmount && (
          <p className="text-sm text-green-500">
            <strong>Winning amount:</strong> {formattedWinningAmount}
          </p>
        )}
      </div>
    );
  }

  if (showWinningAmount) {
    return <>{formattedWinningAmount}</>;
  }

  return <>{formattedAmount}</>;
}
