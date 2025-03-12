import { type Token as TokenType } from '@/hooks/use-tokens';
import { useState, useRef } from 'react';
import { TokenDetailsDialog } from './token-details-dialog';

interface TokenProps {
  token: TokenType;
  onSelect?: (tokenId: number) => void;
  isSelected?: boolean;
  isBurnToken?: boolean;
}

export function Token({
  token,
  onSelect,
  isSelected = false,
  isBurnToken = false,
}: TokenProps) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCount = useRef<number>(0);

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
        className={`relative aspect-square group cursor-pointer transition-all duration-200 ${
          isSelected
            ? isBurnToken
              ? 'ring-2 ring-red-500'
              : 'ring-2 ring-green-500'
            : ''
        }`}
        onClick={handleClick}
      >
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div
            className="absolute inset-[-20%] w-[140%] h-[140%] transition-transform duration-300 group-hover:scale-110 svg-container"
            style={{
              filter: isBurnToken
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
            isBurnToken
              ? 'bg-red-500/0 group-hover:bg-red-500/5 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
              : 'bg-green-500/0 group-hover:bg-green-500/5 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
          } transition-all duration-300 rounded-lg group-hover:scale-105`}
        />
      </div>

      {/* Token Details Dialog */}
      <TokenDetailsDialog
        token={token}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      <style jsx global>{`
        @keyframes pathPulse {
          0%,
          100% {
            transform: scale(1);
            fill: ${isBurnToken ? '#ef4444' : '#018a08'};
          }
          25% {
            transform: scale(1.15);
            fill: ${isBurnToken ? '#dc2626' : '#02bd0b'};
          }
          50% {
            transform: scale(1.2);
            fill: ${isBurnToken ? '#dc2626' : '#02bd0b'};
          }
          75% {
            transform: scale(1.15);
            fill: ${isBurnToken ? '#dc2626' : '#02bd0b'};
          }
        }

        .animate-pulse-subtle {
          animation: pulseSlow 1s ease-in-out infinite;
        }

        .svg-container g path[fill='#018A08'] {
          transform-origin: center;
          animation: pathPulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
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
      `}</style>
    </>
  );
}
