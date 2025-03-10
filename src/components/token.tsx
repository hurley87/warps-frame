import { type Token as TokenType } from '@/hooks/use-tokens';
import { useState, useRef } from 'react';
import { TokenDetailsDialog } from './token-details-dialog';

interface TokenProps {
  token: TokenType;
  onSelect?: (tokenId: number) => void;
  onDrop?: (sourceId: number, targetId: number) => void;
}

export function Token({ token, onSelect, onDrop }: TokenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [isTouchOver, setIsTouchOver] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const touchStartTime = useRef<number>(0);
  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const clickCount = useRef<number>(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle double click for desktop
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

  // Desktop drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', token.id.toString());
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const sourceId = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceId !== token.id) {
      onDrop?.(sourceId, token.id);
    }
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartTime.current = Date.now();
    touchStartPosition.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsTouchActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchActive || !touchStartPosition.current || !elementRef.current)
      return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPosition.current.x;
    const deltaY = touch.clientY - touchStartPosition.current.y;

    // If moved more than 10px, consider it a drag
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setIsDragging(true);
    }

    // Check if touch is over the element
    const rect = elementRef.current.getBoundingClientRect();
    const isOver =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;
    setIsTouchOver(isOver);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.current;

    // If it was a long press (more than 500ms) and minimal movement, show details dialog
    if (touchDuration > 500 && !isDragging) {
      setShowDetailsDialog(true);
    }
    // If it was a quick tap (less than 200ms) and minimal movement, treat as a tap
    else if (touchDuration < 200 && !isDragging) {
      onSelect?.(token.id);
    }

    setIsTouchActive(false);
    setIsDragging(false);
    setIsTouchOver(false);
    touchStartPosition.current = null;
  };

  return (
    <>
      <div
        ref={elementRef}
        className={`relative aspect-square group cursor-pointer transition-all duration-200 ${
          isDragging ? 'opacity-50' : ''
        } ${isTouchOver ? 'drag-over' : ''}`}
        onClick={handleClick}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div
            className="absolute inset-[-20%] w-[140%] h-[140%] transition-transform duration-300 group-hover:scale-110 svg-container"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(1, 138, 8, 0.5))',
            }}
            dangerouslySetInnerHTML={{
              __html: token.image?.startsWith('data:image/svg+xml;base64,')
                ? atob(token.image.split(',')[1])
                : '',
            }}
          />
        </div>
        {!isDragging && (
          <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-all duration-300 rounded-lg group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-105" />
        )}
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
            fill: #018a08;
          }
          25% {
            transform: scale(1.15);
            fill: #02bd0b;
          }
          50% {
            transform: scale(1.2);
            fill: #02bd0b;
          }
          75% {
            transform: scale(1.15);
            fill: #02bd0b;
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

        @keyframes dragGlow {
          0%,
          100% {
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 25px rgba(34, 197, 94, 0.5);
          }
        }

        .drag-over {
          animation: dragGlow 1.5s ease-in-out infinite !important;
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

        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .drag-over {
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}
