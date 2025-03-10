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

export default function Info() {
  return (
    <Drawer>
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
            <DrawerTitle>How it Works</DrawerTitle>
            <DrawerDescription>How it Works</DrawerDescription>
          </VisuallyHidden.Root>

          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div className="text-xl">How it Works</div>
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
              <Pool />
              <div className="space-y-2">
                <h3 className="font-bold">Game Overview</h3>
                <p>
                  Arrows is a Strategic NFT Fusion Game where players compete to
                  create the perfect green arrow token through careful
                  combinations and strategy.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold">How to Play</h3>
                <p>
                  Mint 10 Arrow tokens at a time (each mint contributes to the
                  prize pool)
                </p>
                <p>
                  Combine (composite) your tokens strategically - when you
                  combine two tokens, one is burned and the other evolves
                </p>
                <p>
                  Your goal is to be the first to create a single green arrow
                  token (color #018A08)
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold">Key Points</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Each set of 10 tokens you mint increases the prize pool
                  </li>
                  <li>
                    Tokens can only be combined with others at the same level
                  </li>
                  <li>
                    When combining tokens, choose carefully - one token survives
                    but the other is burned forever
                  </li>
                  <li>
                    The winning token must be a single arrow (not multiple) of
                    the exact shade of green (#018A08)
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold">Prize</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The prize pool accumulates from every 10-token mint</li>
                  <li>
                    First player to create the winning token claims the entire
                    pool
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
