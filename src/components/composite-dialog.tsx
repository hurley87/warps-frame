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

// Add new background flicker effect component
const BackgroundFlicker = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-primary/20 to-blue-900/20 animate-pulse-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-pulse-slow" />
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `flicker ${
              0.5 + Math.random() * 0.5
            }s ease-in-out infinite`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

// Add new energy beam effect component
const EnergyBeams = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent"
          style={{
            left: `${(i * 100) / 8}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `energyBeam 2s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
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
              {isMerging && (
                <>
                  <ConfettiEffect />
                  <BackgroundFlicker />
                  <EnergyBeams />
                </>
              )}
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

        @keyframes flicker {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }

        @keyframes energyBeam {
          0%,
          100% {
            opacity: 0.1;
            transform: rotate(var(--rotation)) scaleY(0.8);
          }
          50% {
            opacity: 0.4;
            transform: rotate(var(--rotation)) scaleY(1.2);
          }
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </Dialog>
  );
}
