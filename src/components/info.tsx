'use client';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';
import { Warp } from './warp';
import { Button } from './ui/button';
import sdk from '@farcaster/frame-sdk';
import { formatUnits } from 'viem';
import { PAYMENT_TOKEN_CONTRACT } from '@/lib/contracts';

export default function Info({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [winningColor, setWinningColor] = useState('#018A08');
  const [winnerClaimPercentage, setWinnerClaimPercentage] =
    useState<number>(60);

  // Fetch the current winning color from the contract
  const { data: fetchedWinningColor } = useReadContract({
    address: WARPS_CONTRACT.address,
    abi: WARPS_CONTRACT.abi,
    functionName: 'getCurrentWinningColor',
    chainId: chain.id,
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  // Fetch the winner claim percentage
  const { data: fetchedWinnerClaimPercentage } = useReadContract({
    address: WARPS_CONTRACT.address,
    abi: WARPS_CONTRACT.abi,
    functionName: 'winnerClaimPercentage',
    chainId: chain.id,
  });

  // Fetch the available prize pool
  const { data: availablePrizePool } = useReadContract({
    address: WARPS_CONTRACT.address,
    abi: WARPS_CONTRACT.abi,
    functionName: 'getAvailablePrizePool',
    chainId: chain.id,
  });

  // Fetch the payment token decimals
  const { data: tokenDecimals } = useReadContract({
    ...PAYMENT_TOKEN_CONTRACT,
    functionName: 'decimals',
    chainId: chain.id,
  });

  // Fetch the payment token symbol
  const { data: tokenSymbol } = useReadContract({
    ...PAYMENT_TOKEN_CONTRACT,
    functionName: 'symbol',
    chainId: chain.id,
  });

  const formatHumanReadable = (value: bigint, decimals: number): string => {
    const rawString = formatUnits(value, decimals);
    const number = parseFloat(rawString);
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Calculate the actual prize amount based on the percentage
  const calculatePrizeAmount = (pool: bigint, percentage: number): bigint => {
    if (!pool || !percentage) return BigInt(0);
    return (pool * BigInt(percentage)) / BigInt(100);
  };

  // Update winning color when data is fetched
  useEffect(() => {
    if (fetchedWinningColor) {
      setWinningColor(fetchedWinningColor);
    }
  }, [fetchedWinningColor]);

  const handleShare = () => {
    const shareText = 'Play Warps, Earn USDC!';
    const shareUrl = encodeURIComponent(`https://warps.fun?ref=${username}`);
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      shareText
    )}&embeds[]=${shareUrl}`;

    console.log('warpcastUrl', warpcastUrl);

    sdk.actions.openUrl(warpcastUrl);
  };

  // Update winner claim percentage when data is fetched
  useEffect(() => {
    if (fetchedWinnerClaimPercentage) {
      setWinnerClaimPercentage(Number(fetchedWinnerClaimPercentage));
    }
  }, [fetchedWinnerClaimPercentage]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="w-full">
        <Button className="border border-white rounded-lg text-black font-bold bg-white hover:bg-white/80 w-full">
          {formatHumanReadable(
            availablePrizePool || BigInt(0),
            tokenDecimals || 18
          )}{' '}
          {tokenSymbol || 'USDC'}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full">
        <div className="h-full flex flex-col bg-black">
          <VisuallyHidden.Root>
            <DrawerTitle>Warps</DrawerTitle>
            <DrawerDescription>Warps</DrawerDescription>
          </VisuallyHidden.Root>
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div className="text-xl">Warps</div>
              <DrawerClose>
                <div className="text-sm text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </DrawerClose>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-4">
            <div className="flex flex-col gap-6 text-sm pb-20">
              <div className="space-y-2 text-md">
                <p>
                  Select two tokens with the same number of warps and combine
                  them. The new token will inherit colors from both parent
                  tokens.
                </p>
                <p>
                  Continue combining until you have a single token with 1 warp.
                </p>
                <p>
                  Your goal is to create a single token with winning color{' '}
                  <span
                    style={{ color: `#${winningColor}`, fontWeight: 'bold' }}
                  >
                    #{winningColor}
                  </span>
                  . Whoever owns that token can claim {winnerClaimPercentage}%
                  of the prize pool.
                </p>
                <p>
                  Once claimed, a new winning color is chosen at random and the
                  race begins again.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">Prize Pool</h3>
                <div className="bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-lg font-semibold">
                    Total Pool:{' '}
                    {formatHumanReadable(
                      availablePrizePool || BigInt(0),
                      tokenDecimals || 18
                    )}{' '}
                    {tokenSymbol || ''}
                  </p>
                  <p className="text-sm text-gray-400">
                    Winner receives {winnerClaimPercentage}% (
                    {formatHumanReadable(
                      calculatePrizeAmount(
                        availablePrizePool || BigInt(0),
                        Number(winnerClaimPercentage || 0)
                      ),
                      tokenDecimals || 18
                    )}{' '}
                    {tokenSymbol || ''})
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">Winning Color</h3>
                <div className="flex items-center gap-2">
                  <Warp color={`#${winningColor}`} className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">Color Legend</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { color: 'FF007A', name: 'Uniswap Pink' },
                    { color: '855DCD', name: 'Farcaster Purple' },
                    { color: 'FF9900', name: 'Bitcoin Orange' },
                    { color: '52b043', name: 'XBOX' },
                    { color: '1da1f2', name: 'Twitter Blue' },
                    { color: '018A08', name: 'Higher Green' },
                    { color: 'F0B90B', name: 'Binance Gold' },
                  ].map((item) => (
                    <div key={item.color} className="flex items-center gap-2">
                      <Warp color={`#${item.color}`} className="w-6 h-6" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">Share with friends</h3>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="w-full"
                >
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
