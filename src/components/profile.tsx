'use client';

import Image from 'next/image';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
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
import { XIcon } from 'lucide-react';
import { type Context } from '@farcaster/frame-sdk';
import { useNetworkCheck } from '@/hooks/use-network-check';

// Default avatar data URL - a simple gray circle
const DEFAULT_AVATAR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzRCNTU2MyIvPjwvc3ZnPg==';

const isDevelopment = process.env.NODE_ENV === 'development';
const NETWORK_NAME = isDevelopment ? 'Base Sepolia' : 'Base';
const NETWORK_ID = isDevelopment ? '84532' : '8453';

interface ProfileProps {
  context?: Context.FrameContext;
}

export function Profile({ context }: ProfileProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const chainId = useChainId();
  const { isCorrectNetwork, switchToBaseNetwork, isSwitchingNetwork } =
    useNetworkCheck();

  return (
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

                  {isConnected && (
                    <div className="bg-secondary/30 backdrop-blur-sm rounded-xl p-6">
                      <h4 className="text-sm font-medium mb-3 text-center">
                        Network Status
                      </h4>
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCorrectNetwork
                              ? 'bg-green-500 animate-pulse'
                              : 'bg-amber-500 animate-pulse'
                          }`}
                        />
                        <span className="text-sm">
                          {isCorrectNetwork
                            ? `${NETWORK_NAME} Network (${NETWORK_ID})`
                            : `Wrong Network (${chainId})`}
                        </span>
                      </div>

                      {!isCorrectNetwork && (
                        <Button
                          onClick={switchToBaseNetwork}
                          disabled={isSwitchingNetwork}
                          variant="outline"
                          className="w-full mt-4 text-sm"
                        >
                          {isSwitchingNetwork
                            ? 'Switching...'
                            : 'Switch to Base Network'}
                        </Button>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() =>
                      isConnected
                        ? disconnect()
                        : connect({ connector: config.connectors[0] })
                    }
                    variant={isConnected ? 'destructive' : 'default'}
                    className="w-full h-12 text-base animate-in fade-in-50 duration-500"
                  >
                    {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
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
  );
}
