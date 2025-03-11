'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialDialog({ isOpen, onClose }: TutorialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">How to Play</DialogTitle>
          <DialogDescription>
            Quick guide to get you started with your newly minted tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Evolve Your Tokens</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <span className="font-medium">View token details:</span>{' '}
                Double-click on any token
              </li>
              <li>
                <span className="font-medium">Drag and drop to evolve:</span>{' '}
                Click and hold on a token, then drop it onto another token
              </li>
              <li>
                <span className="font-medium">Strategic evolution:</span> When
                you combine two tokens, one is burned and the other evolves
              </li>
              <li>
                <span className="font-medium">Win the prize:</span> Create the
                highest green arrow token (color #018A08) to claim the prize
                pool.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Got it, let's play!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
