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
            <div className="flex flex-col gap-6 w-full max-w-[220px] mx-auto">
              <div className="text-center">
                <Token token={sourceToken} />
              </div>
              <div className="text-center">
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
            />
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
