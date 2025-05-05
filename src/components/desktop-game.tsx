'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Mint } from './mint';
import { Tokens } from './tokens';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trophy,
  Flame,
  Coins,
} from 'lucide-react';
import { chain } from '@/lib/chain';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function DesktopGame() {
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

  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const chainId = useChainId();

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

      // Add one special "higher" arrow (green #018A08)
      const higherWarp = {
        id: 99,
        x: 50 + (Math.random() * 30 - 15),
        y: 20 + Math.random() * 10,
        rotation: 0,
        type: 'up',
        color: '#018A08', // The special higher arrow color
      };

      setFloatingWarps([...regularWarps, higherWarp]);
    }
  }, [isConnected]);

  const targetChainId = chain.id;

  // Function to handle chain switching
  const handleSwitchChain = useCallback(async () => {
    if (chainId === targetChainId) return;

    try {
      await switchChain({ chainId: targetChainId });
    } catch (err) {
      console.error('Error switching chain:', err);
    }
  }, [chainId, targetChainId, switchChain]);

  useEffect(() => {
    if (isConnected && chainId !== targetChainId) {
      handleSwitchChain();
    }
  }, [isConnected, chainId, handleSwitchChain, targetChainId]);

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

  // Game content based on connection status
  const renderGameContent = () => {
    if (!isConnected) {
      return (
        <div className="relative flex flex-col items-center justify-center h-screen p-16 text-center space-y-6 overflow-hidden">
          {/* Animated floating warps background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingWarps.map((warp) => (
              <div
                key={warp.id}
                className={`absolute animate-float transition-transform ${
                  warp.color === '#018A08' ? 'z-10 scale-150' : ''
                }`}
                style={
                  {
                    left: `${warp.x}%`,
                    top: `${warp.y}%`,
                    '--rotation': `${warp.rotation}deg`,
                    animationDelay: `${warp.id * 0.2}s`,
                    opacity: warp.color === '#018A08' ? 0.9 : 0.5,
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
              Mint and evolve Warps to create the iconic
              <span className="text-[#018A08] font-bold"> Higher Warp</span> and
              win the prize pool!
            </p>
          </div>

          {/* Connect wallet CTA - Moved up for prominence */}
          <div className="relative z-10 w-full max-w-md">
            <div className="w-fit mx-auto">
              <ConnectButton />
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
                Mint 8 warps for 0.004 ETH. Each mint contributes to the prize
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
      <div className="max-w-[425px] h-[695px] mx-auto bg-background relative">
        <header className="sticky top-0 bg-black z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Warps</span>
            </div>
            <Mint />
          </div>
        </header>
        <Tokens />
      </div>
    );
  };

  // Return different content based on screen size
  return <>{renderGameContent()}</>;
}
