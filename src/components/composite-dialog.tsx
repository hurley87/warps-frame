'use client';

import { Token } from '@/components/token';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
    // Immediately close the dialog
    onOpenChange(false);

    // Then notify parent with the evolved token ID
    setTimeout(() => {
      onCompositeComplete(evolvedTokenId);
    }, 10);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black shadow-xl h-screen flex flex-col justify-center items-center gap-12">
        {sourceToken && targetToken && (
          <div className="grid grid-cols-2 gap-6 py-0 w-full mx-auto px-6">
            <div className="text-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-green-500/20 rounded-xl blur-xl animate-pulse" />
                <Token token={sourceToken} />
              </div>
            </div>
            <div className="text-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-red-500/20 rounded-xl blur-xl animate-pulse" />
                <Token token={targetToken} isBurnToken={true} />
              </div>
            </div>
          </div>
        )}

        {/* Evolve button with green background matching mint button */}
        <div className="">
          <div className="bg-[#7c65c1] hover:bg-[#7c65c1]/90 rounded-md p-1">
            <Composite
              selectedTokens={
                selectedPair ? [selectedPair.source, selectedPair.target] : []
              }
              onCompositeComplete={handleCompositeComplete}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
