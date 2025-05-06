'use client';

import sdk, { type Context } from '@farcaster/frame-sdk';
import { useEffect, useState, useCallback } from 'react';
import { useAccount, useConnect, useSwitchChain, useReadContract } from 'wagmi';
import { Button } from './ui/button';
import { Tokens } from './tokens';
import Info from './info';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trophy,
  Flame,
  Coins,
  Smartphone,
} from 'lucide-react';
import { chain } from '@/lib/chain';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { Warp } from './warp';
import Leaderboard from './leaderboard';
import { Mint } from './mint';

type GameFrameContext = Context.FrameContext & {
  location?: {
    embed?: string;
  };
};

export default function Game() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<GameFrameContext>();
  const [floatingWarps, setFloatingWarps] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      rotation: number;
      type: string;
      color: string;
    }>
  >([]);
  const [winningColor, setWinningColor] = useState('#018A08');

  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  // Fetch the current winning color from the contract
  const { data: fetchedWinningColor } = useReadContract({
    ...WARPS_CONTRACT,
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

  // Generate random floating warps for the background animation
  useEffect(() => {
    if (!isConnected) {
      const warpTypes = ['up', 'down', 'left', 'right'];
      const warpColors = [
        '#FF5A5F',
        '#3490DE',
        '#FFB400',
        '#8A2BE2',
        '#50C878',
      ];

      // Create regular warps
      const regularWarps = Array.from({ length: 12 }, (_, i) => {
        return {
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.floor(Math.random() * 360),
          type: warpTypes[Math.floor(Math.random() * warpTypes.length)],
          color: warpColors[Math.floor(Math.random() * warpColors.length)],
        };
      });

      // Add one special "higher" warp (green #018A08)
      const higherWarp = {
        id: 99,
        x: 50 + (Math.random() * 30 - 15),
        y: 20 + Math.random() * 10,
        rotation: 0,
        type: 'up',
        color: winningColor, // Use the dynamic winning color
      };

      setFloatingWarps([...regularWarps, higherWarp]);
    }
  }, [isConnected, winningColor]);

  const targetChainId = chain.id;

  // Function to handle chain switching
  const handleSwitchChain = useCallback(async () => {
    try {
      await switchChain({ chainId: targetChainId });
    } catch (err) {
      console.error('Error switching chain:', err);
    }
  }, [switchChain, targetChainId]);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      sdk.actions.ready();
      handleSwitchChain();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded, handleSwitchChain]);

  useEffect(() => {
    console.log('context', context);
    if (!context?.client?.added) {
      (async () => {
        await sdk.actions.addFrame();
      })();
    }

    const handleReferral = async () => {
      const url = context?.location;
      const embed = url?.embed;
      const ref = embed?.split('ref=')[1];
      console.log('Current ref value:', ref);
      console.log('Current context:', context);
      if (ref && context?.user?.username) {
        try {
          const response = await fetch('/api/referrals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ref,
              username: context.user.username,
            }),
          });

          if (!response.ok) {
            console.error('Failed to save referral');
          }
        } catch (error) {
          console.error('Error saving referral:', error);
        }
      }
    };

    handleReferral();
  }, [context]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  // Helper function to render the appropriate arrow icon
  const renderArrowIcon = (type: string, color: string) => {
    const style = { color: color, filter: `drop-shadow(0 0 3px ${color}40)` };

    switch (type) {
      case 'up':
        return <ArrowUp style={style} />;
      case 'down':
        return <ArrowDown style={style} />;
      case 'left':
        return <ArrowLeft style={style} />;
      case 'right':
        return <ArrowRight style={style} />;
      default:
        return <ArrowRight style={style} />;
    }
  };

  const username = context?.user?.username as string;

  // Game content based on connection status
  const renderGameContent = () => {
    if (!isConnected) {
      return (
        <div className="relative flex flex-col items-center justify-center h-screen p-16 text-center space-y-6 overflow-hidden">
          {/* Fixed banner for mobile frame experience */}
          {!context && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-primary/20">
              <a
                href="https://warpcast.com/warpsfun/0x745273b9"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                <span>Play in a Farcaster Frame on mobile</span>
              </a>
            </div>
          )}

          {/* Animated floating warps background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingWarps.map((warp) => (
              <div
                key={warp.id}
                className={`absolute animate-float transition-transform ${
                  warp.color === winningColor ? 'z-10 scale-150' : ''
                }`}
                style={
                  {
                    left: `${warp.x}%`,
                    top: `${warp.y}%`,
                    '--rotation': `${warp.rotation}deg`,
                    animationDelay: `${warp.id * 0.2}s`,
                    opacity: warp.color === winningColor ? 0.9 : 0.5,
                  } as React.CSSProperties
                }
              >
                {renderArrowIcon(warp.type, warp.color)}
              </div>
            ))}
          </div>

          {/* Game title and intro with playful animation */}
          <div className="relative z-10 space-y-4">
            <p className="text-lg text-muted-foreground max-w-md">
              Mint and evolve Warps to create the
              <span className={`font-bold`} style={{ color: winningColor }}>
                {' '}
                Warp with the winning color
              </span>{' '}
              and win the prize pool!
            </p>
          </div>

          {/* Connect wallet CTA - Moved up for prominence */}
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-0 border-2 border-primary/50 shadow-lg shadow-primary/20 animate-pulse-slow">
              <Button
                size="lg"
                onClick={() => connect({ connector: connectors[0] })}
                className="w-full bg-white text-black font-bold py-6 text-lg rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Connect Wallet
              </Button>
            </div>
          </div>

          {/* Game mechanics explanation */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-6 w-6 text-[#FFB400]" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Mint Warps</h3>
              <p className="text-xs text-muted-foreground">
                Mint 4 warps for 0.004 ETH. Each mint contributes to the prize
                pool.
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-6 w-6 text-[#FF5A5F]" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Evolve</h3>
              <p className="text-xs text-muted-foreground">
                Combine two warps to evolve one and burn the other. Choose
                wisely!
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-[#FFD700]" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Win the Prize</h3>
              <p className="text-xs text-muted-foreground">
                First to create the Higher Warp (green #018A08) claims the
                entire prize pool!
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-screen h-screen mx-auto bg-background bg-[#17101f] flex flex-col">
        <header className="sticky top-0 bg-[#17101f] z-10">
          <div className="px-6 py-3 flex items-center justify-between">
            <Info username={username} />
            <Warp color={`#${winningColor}`} />
            <Leaderboard username={username} />
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-28 px-2">
          <Tokens username={username} />
        </div>

        {/* Fixed footer Mint button */}
        <footer className="fixed bottom-0 left-0 right-0 bg-purple-900 p-4 py-8 z-20 backdrop-blur-sm">
          <div className="w-full max-w-md mx-auto flex flex-col gap-4">
            <Mint username={username} />
          </div>
        </footer>
      </div>
    );
  };

  // Desktop message component
  const DesktopMessage = () => (
    <div className="hidden sm:flex flex-col items-center justify-center h-screen p-8 text-center">
      <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 border-2 border-primary/50 shadow-lg max-w-md">
        <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Frame Only Experience</h2>
        <p className="text-muted-foreground mb-4">Find it on Farcaster.</p>
      </div>
    </div>
  );

  // Return different content based on screen size
  return (
    <>
      {/* Mobile view - only visible on small screens (below sm breakpoint) */}
      <div className="sm:hidden">{renderGameContent()}</div>

      {/* Desktop message - only visible on sm screens and above */}
      <DesktopMessage />
    </>
  );
}
