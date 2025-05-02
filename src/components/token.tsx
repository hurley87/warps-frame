import { type Token as TokenType } from '@/hooks/use-tokens';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TokenDetailsDialog } from './token-details-dialog';
import { useReadContract } from 'wagmi';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { chain } from '@/lib/chain';
import { Sparkles } from 'lucide-react';

interface TokenProps {
  token: TokenType;
  onSelect?: (tokenId: number) => void;
  isSelected?: boolean;
  isBurnToken?: boolean;
  isEvolvedToken?: boolean;
}

export function Token({
  token,
  onSelect,
  isSelected = false,
  isBurnToken = false,
  isEvolvedToken = false,
}: TokenProps) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCount = useRef<number>(0);
  const [winningColor, setWinningColor] = useState('#018A08');

  // Ensure evolved token comes into view & catches attention
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isEvolvedToken && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [isEvolvedToken]);

  // Handle click for selection and double click for details
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    clickCount.current += 1;

    if (clickCount.current === 1) {
      // Single click
      if (clickTimer.current) clearTimeout(clickTimer.current);

      clickTimer.current = setTimeout(() => {
        // If timer expires before second click, it's a single click
        if (clickCount.current === 1) {
          onSelect?.(token.id);
        }
        clickCount.current = 0;
      }, 300); // 300ms threshold for double click
    } else {
      // Double click
      if (clickTimer.current) clearTimeout(clickTimer.current);
      clickCount.current = 0;
      e.preventDefault(); // Prevent any default behavior
      setShowDetailsDialog(true);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative aspect-square group cursor-pointer transition-all duration-200 ${
          isEvolvedToken ? 'animate-evolved-pop' : ''
        }`}
        onClick={handleClick}
      >
        <div className="absolute inset-0 overflow-hidden rounded-t-lg">
          <div
            className={`absolute inset-[-20%] w-[140%] h-[140%] transition-transform duration-300 group-hover:scale-110 svg-container ${
              isEvolvedToken ? 'evolved-token-glow' : ''
            }`}
            style={{
              filter: isEvolvedToken
                ? 'drop-shadow(0 0 12px rgba(250, 204, 21, 0.7))'
                : isBurnToken
                ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))'
                : 'drop-shadow(0 0 8px rgba(1, 138, 8, 0.5))',
            }}
            dangerouslySetInnerHTML={{
              __html: token.image?.startsWith('data:image/svg+xml;base64,')
                ? atob(token.image.split(',')[1])
                : '',
            }}
          />
        </div>
        <div
          className={`absolute inset-0 ${
            isEvolvedToken
              ? 'bg-yellow-500/10 group-hover:bg-yellow-500/15 group-hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]'
              : isBurnToken
              ? 'bg-red-500/0 group-hover:bg-red-500/5 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
              : 'bg-green-500/0 group-hover:bg-green-500/5 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
          } transition-all duration-300 rounded-lg group-hover:scale-105`}
        >
          {/* Extra glow overlay when evolved */}
          {isEvolvedToken && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-yellow-400/20 blur-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0.6, 0.2, 0.6], scale: [0.9, 1.05, 0.9] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </div>

        {/* NEW badge */}
        {isEvolvedToken && (
          <motion.div
            className="absolute -top-2 -right-2 bg-yellow-400 text-[#17101f] text-[10px] font-bold rounded px-1 py-[1px] shadow-md pointer-events-none"
            initial={{ scale: 0, rotate: 45, opacity: 0 }}
            animate={{ scale: [1.4, 1], rotate: [45, 0], opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            NEW
          </motion.div>
        )}

        {/* Sparkle icon pulse */}
        {isEvolvedToken && (
          <motion.div
            className="absolute -bottom-1 -left-1 text-yellow-300"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 0.9, 1],
              opacity: [0, 1, 1, 0],
              rotate: [0, 45, 90],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      {/* Token Details Dialog */}
      <TokenDetailsDialog
        token={token}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <style jsx global>{`
        @keyframes greenPathPulse {
          0%,
          100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.15);
          }
          50% {
            transform: scale(1.2);
          }
          75% {
            transform: scale(1.15);
          }
        }

        @keyframes redPathPulse {
          0%,
          100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.15);
          }
          50% {
            transform: scale(1.2);
          }
          75% {
            transform: scale(1.15);
          }
        }

        @keyframes evolvedPathPulse {
          0%,
          100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.15);
          }
          50% {
            transform: scale(1.2);
          }
          75% {
            transform: scale(1.15);
          }
        }

        .animate-pulse-subtle {
          animation: pulseSlow 1s ease-in-out infinite;
        }

        .animate-pulse-evolved {
          animation: pulseEvolved 1.5s ease-in-out infinite;
        }

        @keyframes pulseEvolved {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(250, 204, 21, 0.8);
          }
        }

        .svg-container g path[fill='${winningColor}'] {
          transform-origin: center;
          animation: ${isBurnToken ? 'redPathPulse' : 'greenPathPulse'} 1s
            cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
        }

        .evolved-token-glow g path[fill='${winningColor}'] {
          transform-origin: center;
          animation: evolvedPathPulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
        }

        @keyframes greenGlowPulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
          }
        }

        @keyframes redGlowPulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
          }
        }

        @keyframes yellowGlowPulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(250, 204, 21, 0.8);
          }
        }

        .source-arrow-container .group {
          animation: greenGlowPulse 2s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
        }

        .target-arrow-container .group {
          animation: redGlowPulse 2s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
        }

        .target-arrow-container .group:hover {
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.4) !important;
        }

        .target-arrow-container .group .absolute {
          background-color: rgba(239, 68, 68, 0.05) !important;
        }

        /* Pop in when evolved */
        @keyframes evolvedPop {
          0% {
            transform: scale(0.8);
          }
          60% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-evolved-pop {
          animation: evolvedPop 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
