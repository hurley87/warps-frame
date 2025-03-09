'use client';

import sdk, { type Context } from '@farcaster/frame-sdk';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { config } from '@/components/providers/WagmiProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Mint } from './mint';
import { Tokens } from './tokens';
import { Info } from 'lucide-react';
import { XIcon } from 'lucide-react';
import { Pool } from './pool';

// Default avatar data URL - a simple gray circle
const DEFAULT_AVATAR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzRCNTU2MyIvPjwvc3ZnPg==';

export default function Game() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    if (!context?.client?.added) {
      (async () => {
        const result = await sdk.actions.addFrame();
        console.log('result', result);
      })();
    }
  }, [context]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[695px] p-6 text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Arrows</h1>
          <p className="text-muted-foreground">
            Combine arrows to create unique compositions and unlock special
            combinations.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            size="lg"
            onClick={() => connect({ connector: config.connectors[0] })}
            className="animate-pulse"
          >
            Connect Wallet to Start
          </Button>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to start minting and combining arrows
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[425px] h-[695px] mx-auto bg-background relative">
      <header className="sticky top-0 bg-black z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Arrows</span>
          </div>
          <div className="flex items-center gap-2">
            <Info />
            <Dialog>
              <DialogTrigger>
                <span className="flex items-center gap-2">
                  <Image
                    src={context?.user?.pfpUrl || DEFAULT_AVATAR}
                    alt="Profile picture"
                    width={24}
                    height={24}
                    className="rounded-full"
                    unoptimized
                  />
                  <span className="text-sm">{context?.user?.username}</span>
                </span>
              </DialogTrigger>
              <DialogContent className="inset-0 fixed w-screen h-screen p-0 bg-background">
                <DialogHeader className="h-full flex flex-col items-center justify-center">
                  <div className="w-full max-w-md mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DialogTitle className="text-2xl font-bold text-center mb-8">
                      Profile
                    </DialogTitle>
                    <DialogContent>
                      <div className="space-y-8">
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background blur-2xl -z-10 rounded-full" />
                            <Image
                              src={context?.user?.pfpUrl || DEFAULT_AVATAR}
                              alt={`${context?.user?.username}'s profile picture`}
                              width={96}
                              height={96}
                              className="rounded-full shadow-xl animate-in zoom-in-50 duration-500"
                              unoptimized
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-semibold text-foreground">
                              {context?.user?.username}
                            </h3>
                            <p className="text-sm text-muted-foreground font-mono">
                              {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-secondary/30 backdrop-blur-sm rounded-xl p-6">
                            <h4 className="text-sm font-medium mb-3 text-center">
                              Wallet Status
                            </h4>
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isConnected
                                    ? 'bg-green-500 animate-pulse'
                                    : 'bg-red-500'
                                }`}
                              />
                              <span className="text-sm">
                                {isConnected ? 'Connected' : 'Disconnected'}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={() =>
                              isConnected
                                ? disconnect()
                                : connect({ connector: config.connectors[0] })
                            }
                            variant={isConnected ? 'destructive' : 'default'}
                            className="w-full h-12 text-base animate-in fade-in-50 duration-500"
                          >
                            {isConnected
                              ? 'Disconnect Wallet'
                              : 'Connect Wallet'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </div>
                </DialogHeader>
                <DialogClose className="absolute top-4 right-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <XIcon className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <Pool />
      <Mint />
      <Tokens />
    </div>
  );
}
