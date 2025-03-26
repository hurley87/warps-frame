'use client';

import sdk, { type Context } from '@farcaster/frame-sdk';
import { useEffect, useState } from 'react';
import { useAccount, useChainId, useConnect, useSwitchChain } from 'wagmi';
import { config } from '@/components/providers/WagmiProvider';
import { Button } from './ui/button';
import { Mint } from './mint';
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

export default function Game() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [floatingArrows, setFloatingArrows] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      rotation: number;
      type: string;
      color: string;
    }>
  >([]);

  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const { switchChain } = useSwitchChain();

  const chainId = useChainId();
  console.log('chainId', chainId);

  // Generate random floating arrows for the background animation
  useEffect(() => {
    if (!isConnected) {
      const arrowTypes = ['up', 'down', 'left', 'right'];
      const arrowColors = [
        '#FF5A5F',
        '#3490DE',
        '#FFB400',
        '#8A2BE2',
        '#50C878',
      ];

      // Create regular arrows
      const regularArrows = Array.from({ length: 12 }, (_, i) => {
        return {
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.floor(Math.random() * 360),
          type: arrowTypes[Math.floor(Math.random() * arrowTypes.length)],
          color: arrowColors[Math.floor(Math.random() * arrowColors.length)],
        };
      });

      // Add one special "higher" arrow (green #018A08)
      const higherArrow = {
        id: 99,
        x: 50 + (Math.random() * 30 - 15),
        y: 20 + Math.random() * 10,
        rotation: 0,
        type: 'up',
        color: '#018A08', // The special higher arrow color
      };

      setFloatingArrows([...regularArrows, higherArrow]);
    }
  }, [isConnected]);

  const targetChainId = chain.id;

  // Function to handle chain switching
  const handleSwitchChain = async () => {
    try {
      await switchChain({ chainId: targetChainId });
    } catch (err) {
      console.error('Error switching chain:', err);
    }
  };

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
  }, [isSDKLoaded]);

  useEffect(() => {
    if (!context?.client?.added) {
      (async () => {
        await sdk.actions.addFrame();
      })();
    }
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

  console.log('context', context);

  // Game content based on connection status
  const renderGameContent = () => {
    if (!isConnected) {
      return (
        <div className="relative flex flex-col items-center justify-center h-screen p-16 text-center space-y-6 overflow-hidden">
          {/* Fixed banner for mobile frame experience */}
          {!context && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-primary/20">
              <a
                href="https://warpcast.com/higherarrows"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                <span>Play in a Farcaster Frame on mobile</span>
              </a>
            </div>
          )}

          {/* Animated floating arrows background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingArrows.map((arrow) => (
              <div
                key={arrow.id}
                className={`absolute animate-float transition-transform ${
                  arrow.color === '#018A08' ? 'z-10 scale-150' : ''
                }`}
                style={
                  {
                    left: `${arrow.x}%`,
                    top: `${arrow.y}%`,
                    '--rotation': `${arrow.rotation}deg`,
                    animationDelay: `${arrow.id * 0.2}s`,
                    opacity: arrow.color === '#018A08' ? 0.9 : 0.5,
                  } as React.CSSProperties
                }
              >
                {renderArrowIcon(arrow.type, arrow.color)}
              </div>
            ))}
          </div>

          {/* Game title and intro with playful animation */}
          <div className="relative z-10 space-y-4">
            <p className="text-lg text-muted-foreground max-w-md">
              Mint and evolve Arrows to create the iconic
              <span className="text-[#018A08] font-bold">
                {' '}
                Higher Arrow
              </span>{' '}
              and win the prize pool!
            </p>
          </div>

          {/* Connect wallet CTA - Moved up for prominence */}
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-0 border-2 border-primary/50 shadow-lg shadow-primary/20 animate-pulse-slow">
              <Button
                size="lg"
                onClick={() => connect({ connector: config.connectors[0] })}
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
              <h3 className="font-semibold mb-1 text-sm">Mint Arrows</h3>
              <p className="text-xs text-muted-foreground">
                Mint 8 arrows for 0.008 ETH. Each mint contributes to the prize
                pool.
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-6 w-6 text-[#FF5A5F]" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Evolve</h3>
              <p className="text-xs text-muted-foreground">
                Combine two arrows to evolve one and burn the other. Choose
                wisely!
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-[#FFD700]" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Win the Prize</h3>
              <p className="text-xs text-muted-foreground">
                First to create the Higher Arrow (green #018A08) claims the
                entire prize pool!
              </p>
            </div>
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
              <Info />
            </div>
            <Mint />
          </div>
        </header>
        <Tokens />
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
