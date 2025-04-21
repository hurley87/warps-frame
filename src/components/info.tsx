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
import { useCallback, useState } from 'react';

export default function Info() {
  const [open, setOpen] = useState(true);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl('https://opensea.io/collection/arrows-12');
  }, []);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
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
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
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
                  Warps is a game where players compete to create the higher
                  green warp through strategic NFT evolutions.
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
                <h3 className="font-bold">Prize Pool</h3>
                <Pool />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">How to Play</h3>
                <p>
                  Mint 8 tokens for 0.004 ETH. Each mint contributes to the
                  prize pool.
                </p>
                <p>Double click on an token to view its details.</p>
                <p>
                  To evolve a token, click the token you want to keep and a
                  second to burn.
                </p>
                <p>
                  Your goal is to create a single higher token with color
                  #018A08. Whoever owns that token can claim the entire prize
                  pool.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
