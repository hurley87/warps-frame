'use client';

import sdk, { type Context } from '@farcaster/frame-sdk';
import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { config } from '@/components/providers/WagmiProvider';
import { Button } from './ui/button';
import { Mint } from './mint';
import { Tokens } from './tokens';
import { Info } from 'lucide-react';
import { Pool } from './pool';
import { Profile } from './profile';

export default function Game() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const { isConnected } = useAccount();
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
        // TODO: think about saving this to DB
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
            <Profile context={context} />
          </div>
        </div>
      </header>
      <Pool />
      <Mint />
      <Tokens />
    </div>
  );
}
