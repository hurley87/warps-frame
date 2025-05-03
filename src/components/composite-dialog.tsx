'use client';

import { useState } from 'react';
import { Token } from '@/components/token';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Composite } from '@/components/composite';
import { cn } from '@/lib/utils';

const ConfettiEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
            transform: `translate(-50%, -50%) rotate(${
              Math.random() * 360
            }deg)`,
            animation: `confetti 1s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

interface CompositeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceToken: {
    id: number;
    name: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  } | null;
  targetToken: {
    id: number;
    name: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  } | null;
  selectedPair: {
    source: number;
    target: number;
  } | null;
  onCompositeComplete: (evolvedTokenId?: number) => void;
}

export function CompositeDialog({
  open,
  onOpenChange,
  sourceToken,
  targetToken,
  selectedPair,
  onCompositeComplete,
}: CompositeDialogProps) {
  const [isMerging, setIsMerging] = useState(false);

  // Handle dialog close to reset selection state
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // If dialog is closing, call onCompositeComplete to reset selection state
      onCompositeComplete();
      setIsMerging(false);
    }
    onOpenChange(newOpen);
  };

  // Handle composite completion with the evolved token ID
  const handleCompositeComplete = (evolvedTokenId?: number) => {
    // Immediately close the dialog
    onOpenChange(false);
    setIsMerging(false);

    // Then notify parent with the evolved token ID
    setTimeout(() => {
      onCompositeComplete(evolvedTokenId);
    }, 10);
  };

  // Start merging animation when user clicks on the composite button
  const handleStartMerge = () => {
    if (sourceToken && targetToken) {
      setIsMerging(true);
      // Allow animation to run before actual merging process
      return true;
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Full-screen dialog container */}
      <DialogContent
        style={{
          paddingTop: '0px',
        }}
        className="bg-[#17101f] w-screen h-screen p-0 overflow-hidden z-50 pt-0"
      >
        {/* Scrollable token preview area */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-0 pb-20">
          {sourceToken && targetToken && (
            <div className="flex flex-col gap-6 w-full max-w-[220px] mx-auto relative">
              <div
                className={cn(
                  'text-center transition-all duration-[30000ms] ease-in-out',
                  isMerging && 'animate-spin-slow scale-0 opacity-0'
                )}
              >
                <Token token={sourceToken} />
              </div>
              {isMerging && <ConfettiEffect />}
              <div
                className={cn(
                  'text-center transition-all duration-[30000ms] ease-in-out',
                  isMerging && 'animate-spin-slow scale-0 opacity-0'
                )}
              >
                <Token token={targetToken} isBurnToken={true} />
              </div>
            </div>
          )}
        </div>

        {/* Fixed footer with evolve button */}
        <footer className="fixed bottom-0 left-0 right-0 bg-[#17101f] p-4">
          <div className="bg-[#7c65c1] hover:bg-[#7c65c1]/90 rounded-md p-1">
            <Composite
              key={
                selectedPair
                  ? `${selectedPair.source}-${selectedPair.target}`
                  : 'no-selection'
              }
              selectedTokens={
                selectedPair ? [selectedPair.source, selectedPair.target] : []
              }
              onCompositeComplete={handleCompositeComplete}
              onMergeStart={handleStartMerge}
            />
          </div>
        </footer>
      </DialogContent>

      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(
                calc(-50% + ${Math.random() * 200 - 100}px),
                calc(-50% + ${Math.random() * 200 - 100}px)
              )
              rotate(${Math.random() * 720}deg) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </Dialog>
  );
}
