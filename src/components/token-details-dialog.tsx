'use client';

import { type Token as TokenType } from '@/hooks/use-tokens';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useCallback, useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { WARPS_CONTRACT_ADDRESSES, WARPS_CONTRACT } from '@/lib/contracts';
import { ShareArrowButton } from './share-arrow-button';
import { useReadContract } from 'wagmi';
import { chain } from '@/lib/chain';

interface TokenDetailsDialogProps {
  token: TokenType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hideTokenPageLink?: boolean;
  hideCloseButton?: boolean;
}

export function TokenDetailsDialog({
  token,
  open,
  onOpenChange,
  hideTokenPageLink = false,
  hideCloseButton = false,
}: TokenDetailsDialogProps) {
  const [winningColor, setWinningColor] = useState('#018A08');

  console.log('hideTokenPageLink', hideTokenPageLink);

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

  // Update winning color when data is fetched
  useEffect(() => {
    if (fetchedWinningColor) {
      setWinningColor(fetchedWinningColor);
    }
  }, [fetchedWinningColor]);

  // Create a safe reference to token in case it's null
  const tokenId = token?.id;

  // Generate OpenSea URL safely - will be undefined if token is null
  const openSeaUrl = token
    ? `https://opensea.io/item/base/${WARPS_CONTRACT_ADDRESSES.production}/${tokenId}`
    : '';

  // Generate Highlight URL safely - will be undefined if token is null
  const highlightUrl = token
    ? `https://highlight.xyz/mint/base:${WARPS_CONTRACT_ADDRESSES.production}:64d248a33b573b35dbe5f5b802e2386f?tokenId=${tokenId}`
    : '';

  // Move useCallback outside of the conditional
  const openOpenSeaUrl = useCallback(() => {
    if (openSeaUrl) {
      sdk.actions.openUrl(openSeaUrl);
    }
  }, [openSeaUrl]);

  const openHighlightUrl = useCallback(() => {
    if (highlightUrl) {
      sdk.actions.openUrl(highlightUrl);
    }
  }, [highlightUrl]);

  if (!token) return null;

  // Extract token attributes for display
  const attributes = token.attributes.reduce<Record<string, string>>(
    (acc, attr) => {
      if (attr.trait_type !== 'Color Band') {
        acc[attr.trait_type] = attr.value;
      }
      return acc;
    },
    {}
  );

  return (
    <Dialog
      open={open}
      onOpenChange={hideCloseButton ? undefined : onOpenChange}
    >
      <DialogContent className="w-full h-screen overflow-hidden bg-black text-white border-none min-h-screen overflow-y-auto">
        {!hideCloseButton && (
          <VisuallyHidden.Root>
            <DialogTitle>Token #{token.id} Details</DialogTitle>
          </VisuallyHidden.Root>
        )}
        <div className="flex flex-col">
          {/* Full-width image with zoom and crop effect */}
          <div className="w-full relative aspect-square overflow-hidden">
            <div
              className="absolute inset-[-20%] w-[140%] h-[140%] svg-container"
              style={{
                filter: `drop-shadow(0 0 12px ${winningColor}cc)`,
              }}
              dangerouslySetInnerHTML={{
                __html: token.image?.startsWith('data:image/svg+xml;base64,')
                  ? atob(token.image.split(',')[1])
                  : '',
              }}
            />
          </div>

          {/* Token details */}
          <div className="">
            <div className="flex flex-wrap gap-12 p-2">
              {Object.entries(attributes).map(([trait, value]) => (
                <div key={trait} className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {trait}
                  </span>
                  <span className="font-medium text-white text-xs">
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Token ID
                </span>
                <span className="font-medium text-white text-xs">
                  #{token.id}
                </span>
              </div>

              {/* Links Section */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Links
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={openHighlightUrl}
                    className="text-white text-xs border-b border-white/50 hover:border-white transition-colors flex items-center gap-1.5 w-fit"
                  >
                    <span>Highlight</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={openOpenSeaUrl}
                    className="text-white text-xs border-b border-white/50 hover:border-white transition-colors flex items-center gap-1.5 w-fit"
                  >
                    <span>OpenSea</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </button>
                  <ShareArrowButton tokenId={token.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <style jsx global>{`
        [data-slot='dialog-close'] {
          top: 1rem;
          right: 1rem;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          padding: 0.5rem;
          color: white;
          transition: background-color 0.2s;
          z-index: 50;
        }

        [data-slot='dialog-close']:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }

        [data-slot='dialog-content'] {
          padding-top: 3rem;
        }

        /* Ensure the animation styles are applied in the dialog */
        .svg-container g path[fill='${winningColor}'] {
          transform-origin: center;
          animation: pathPulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
        }

        @keyframes pathPulse {
          0%,
          100% {
            transform: scale(1);
            fill: ${winningColor};
          }
          25% {
            transform: scale(1.15);
            fill: ${winningColor};
          }
          50% {
            transform: scale(1.2);
            fill: ${winningColor};
          }
          75% {
            transform: scale(1.15);
            fill: ${winningColor};
          }
        }

        .animate-pulse-subtle {
          animation: pulseSlow 3s ease-in-out infinite;
        }

        @keyframes pulseSlow {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </Dialog>
  );
}
