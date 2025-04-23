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
import { Pool } from './pool';
import sdk from '@farcaster/frame-sdk';
import { useCallback, useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { WARPS_CONTRACT, PAYMENT_TOKEN_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';
import { Warp } from './warp';

export default function Info() {
  const [open, setOpen] = useState(true);
  const [winningColor, setWinningColor] = useState('#018A08');
  const [paymentTokenSymbol, setPaymentTokenSymbol] =
    useState<string>('Tokens');
  const [winnerClaimPercentage, setWinnerClaimPercentage] =
    useState<number>(60);
  const [formattedMintPrice, setFormattedMintPrice] = useState<string>('');

  const openUrl = useCallback(() => {
    sdk.actions.openUrl('https://opensea.io/collection/arrows-12');
  }, []);

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

  // Fetch the payment token symbol
  const { data: fetchedSymbol } = useReadContract({
    address: PAYMENT_TOKEN_CONTRACT.address,
    abi: PAYMENT_TOKEN_CONTRACT.abi,
    functionName: 'symbol',
    chainId: chain.id,
  });

  // Fetch the winner claim percentage
  const { data: fetchedWinnerClaimPercentage } = useReadContract({
    address: WARPS_CONTRACT.address,
    abi: WARPS_CONTRACT.abi,
    functionName: 'winnerClaimPercentage',
    chainId: chain.id,
  });

  // Fetch mint price from contract
  const { data: mintPrice } = useReadContract({
    address: WARPS_CONTRACT.address,
    abi: WARPS_CONTRACT.abi,
    functionName: 'mintPrice',
    chainId: chain.id,
  });

  // Fetch token decimals
  const { data: tokenDecimals } = useReadContract({
    address: PAYMENT_TOKEN_CONTRACT.address,
    abi: PAYMENT_TOKEN_CONTRACT.abi,
    functionName: 'decimals',
    chainId: chain.id,
  });

  // Format mint price when both price and decimals are available
  useEffect(() => {
    if (mintPrice !== undefined && tokenDecimals !== undefined) {
      // Special case for USDC with 6 decimals
      if (Number(tokenDecimals) === 6) {
        setFormattedMintPrice(
          (Number(mintPrice) / 10 ** Number(tokenDecimals)).toFixed(2)
        );
      } else {
        setFormattedMintPrice(
          (Number(mintPrice) / 10 ** Number(tokenDecimals)).toString()
        );
      }
    }
  }, [mintPrice, tokenDecimals]);

  // Update winning color when data is fetched
  useEffect(() => {
    if (fetchedWinningColor) {
      setWinningColor(fetchedWinningColor);
    }
  }, [fetchedWinningColor]);

  // Update token symbol when data is fetched
  useEffect(() => {
    if (fetchedSymbol) {
      setPaymentTokenSymbol(fetchedSymbol);
    }
  }, [fetchedSymbol]);

  // Update winner claim percentage when data is fetched
  useEffect(() => {
    if (fetchedWinnerClaimPercentage) {
      setWinnerClaimPercentage(Number(fetchedWinnerClaimPercentage));
    }
  }, [fetchedWinnerClaimPercentage]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <span className="text-sm font-semibold cursor-pointer">
          How To Play
        </span>
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
              <div className="space-y-2">
                <h3 className="font-bold">Overview</h3>
                <p>
                  Warps is a game where players compete to create the winning
                  warp through strategic NFT evolutions.
                </p>
                <p>
                  <span
                    onClick={openUrl}
                    className="text-blue-500 cursor-pointer"
                  >
                    View Collection on Opensea
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">Total Token Pool</h3>
                <Pool />
                <p className="text-xs text-gray-400">
                  Winner receives {winnerClaimPercentage}% of the pool (
                  <Pool showWinningAmount={true} />)
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">Winning Color</h3>
                <div className="flex items-center gap-2">
                  <Warp color={`#${winningColor}`} className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">How to Play</h3>
                <p>
                  You can deposit {formattedMintPrice} {paymentTokenSymbol} to
                  mint four tokens.
                </p>
                <p>Double click on an token to view its details.</p>
                <p>
                  To evolve a token, click the token you want to keep and a
                  second to burn.
                </p>
                <p>
                  Your goal is to create a single token with winning color{' '}
                  <span style={{ color: winningColor, fontWeight: 'bold' }}>
                    #{winningColor}
                  </span>
                  . Whoever owns that token can claim {winnerClaimPercentage}%
                  of the prize pool.
                </p>
                <p>
                  The winning color changes after someone wins. The winning
                  color is chosen at random.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
