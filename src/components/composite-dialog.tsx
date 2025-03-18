'use client';

import { Token } from '@/components/token';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Composite } from '@/components/composite';

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
  // Handle dialog close to reset selection state
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // If dialog is closing, call onCompositeComplete to reset selection state
      onCompositeComplete();
    }
    onOpenChange(newOpen);
  };

  // Handle composite completion with the evolved token ID
  const handleCompositeComplete = (evolvedTokenId?: number) => {
    onCompositeComplete(evolvedTokenId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-black border-green-500/20 shadow-2xl flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center pb-32">
          <div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-white text-2xl mb-2"></DialogTitle>
              <DialogDescription className="text-black">
                {`To evolve, keep one and burn the other. Evolution is irreversible.`}
              </DialogDescription>
            </DialogHeader>

            {sourceToken && targetToken && (
              <div className="grid grid-cols-2 gap-8 py-8 w-full max-w-md">
                <div className="text-center source-arrow-container">
                  <p className="text-sm font-bold text-green-400 mb-4 uppercase tracking-wider">
                    🌟 Keep 🌟
                  </p>
                  <div className="relative">
                    <div className="absolute -inset-2 bg-green-500/20 rounded-xl blur-xl animate-pulse" />
                    <div className="absolute -inset-4 bg-green-500/10 rounded-2xl blur-2xl animate-pulse-slow" />
                    <Token token={sourceToken} />
                  </div>
                </div>
                <div className="text-center target-arrow-container">
                  <p className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider">
                    🔥 Sacrifice 🔥
                  </p>
                  <div className="relative">
                    <div className="absolute -inset-2 bg-red-500/20 rounded-xl blur-xl animate-pulse" />
                    <div className="absolute -inset-4 bg-red-500/10 rounded-2xl blur-2xl animate-pulse-slow" />
                    <Token token={targetToken} isBurnToken={true} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4">
            <Composite
              selectedTokens={
                selectedPair ? [selectedPair.source, selectedPair.target] : []
              }
              onCompositeComplete={handleCompositeComplete}
            />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
