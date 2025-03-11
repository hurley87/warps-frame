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
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const pointerStartTime = useRef<number>(0);
  const pointerStartPosition = useRef<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const dragThreshold = 5; // Small threshold for responsive dragging
  const longPressThreshold = 500; // ms
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const clickCount = useRef<number>(0);
  const currentDragId = useRef<number | null>(null);

  // Handle pointer down (start of potential drag or click)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Capture the pointer to ensure we get all events
    e.currentTarget.setPointerCapture(e.pointerId);

    pointerStartTime.current = Date.now();
    pointerStartPosition.current = { x: e.clientX, y: e.clientY };
    setIsPointerDown(true);

    // Calculate offset from the element's top-left corner
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    // Set up long press timer for showing details
    longPressTimer.current = setTimeout(() => {
      if (isPointerDown && !isDragging) {
        setShowDetailsDialog(true);
      }
    }, longPressThreshold);
  };

  // Handle pointer move (potential drag)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown || !pointerStartPosition.current) return;

    const deltaX = e.clientX - pointerStartPosition.current.x;
    const deltaY = e.clientY - pointerStartPosition.current.y;

    // If moved more than threshold, start dragging
    if (
      !isDragging &&
      (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)
    ) {
      setIsDragging(true);
      currentDragId.current = token.id;

      // Clear any pending timers
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  // Handle pointer up (end of drag or click)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const pointerDuration = Date.now() - pointerStartTime.current;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // If it wasn't a drag and was a quick tap, handle as a click
    if (!isDragging && pointerDuration < 200) {
      handleClickOrDoubleTap(e);
    }

    // If we were dragging and have a drop target, handle the drop
    if (isDragging && currentDragId.current !== null) {
      // We're not over a valid drop target, just end the drag
      setIsDragging(false);
      currentDragId.current = null;
    }

    // Reset state
    setIsPointerDown(false);
    pointerStartPosition.current = null;
    dragOffset.current = null;

    // Release pointer capture
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Handle pointer cancel (e.g., user scrolls during drag)
  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    // Clear any timers
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Reset state
    setIsDragging(false);
    setIsPointerDown(false);
    pointerStartPosition.current = null;
    dragOffset.current = null;
    currentDragId.current = null;

    // Release pointer capture
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Handle click or double tap
  const handleClickOrDoubleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    clickCount.current += 1;

    if (clickCount.current === 1) {
      // First click/tap
      if (clickTimer.current) clearTimeout(clickTimer.current);

      clickTimer.current = setTimeout(() => {
        // If timer expires before second click, it's a single click
        if (clickCount.current === 1) {
          onSelect?.(token.id);
        }
        clickCount.current = 0;
      }, 300); // 300ms threshold for double click/tap
    } else {
      // Double click/tap
      if (clickTimer.current) clearTimeout(clickTimer.current);
      clickCount.current = 0;
      e.preventDefault();
      setShowDetailsDialog(true);
    }
  };

  // Handle when another token is dropped on this one
  const handleTokenDrop = (sourceId: number) => {
    if (sourceId !== token.id) {
      onDrop?.(sourceId, token.id);
    }
  };

  // Handle when this token is dragged over another token
  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      isDragging &&
      currentDragId.current !== null &&
      currentDragId.current !== token.id
    ) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  return (
    <>
      <div
        ref={elementRef}
        className={`relative aspect-square group cursor-grab transition-all duration-200 ${
          isDragging ? 'opacity-50 cursor-grabbing' : ''
        } ${isPointerDown && !isDragging ? 'touch-pulse' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{ touchAction: 'none' }} // Prevent browser handling of gestures
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

        @keyframes touchPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1);
          }
        }

        .touch-pulse {
          animation: touchPulse 0.3s ease-in-out;
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
