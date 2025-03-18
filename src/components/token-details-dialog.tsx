'use client';

import { type Token as TokenType } from '@/hooks/use-tokens';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface TokenDetailsDialogProps {
  token: TokenType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenDetailsDialog({
  token,
  open,
  onOpenChange,
}: TokenDetailsDialogProps) {
  if (!token) return null;

  // Extract token attributes for display
  const attributes = token.attributes.reduce<Record<string, string>>(
    (acc, attr) => {
      acc[attr.trait_type] = attr.value;
      return acc;
    },
    {}
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[600px] overflow-hidden bg-black text-white border-none p-6 h-full">
        <VisuallyHidden.Root>
          <DialogTitle>Token #{token.id} Details</DialogTitle>
        </VisuallyHidden.Root>
        <div className="flex flex-col">
          {/* Full-width image with zoom and crop effect */}
          <div className="w-full relative aspect-square overflow-hidden">
            <div
              className="absolute inset-[-20%] w-[140%] h-[140%] svg-container"
              style={{
                filter: 'drop-shadow(0 0 12px rgba(1, 138, 8, 0.7))',
              }}
              dangerouslySetInnerHTML={{
                __html: token.image?.startsWith('data:image/svg+xml;base64,')
                  ? atob(token.image.split(',')[1])
                  : '',
              }}
            />
          </div>

          {/* Token details */}
          <div className="px-16">
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(attributes).map(([trait, value]) => (
                <div key={trait} className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {trait}
                  </span>
                  <span className="font-medium text-white text-xs">
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Token ID
                </span>
                <span className="font-medium text-white text-xs">
                  #{token.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <style jsx global>{`
        [data-slot='dialog-close'] {
          top: 1rem;
          right: 1rem;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          padding: 0.5rem;
          color: white;
          transition: background-color 0.2s;
          z-index: 50;
        }

        [data-slot='dialog-close']:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }

        [data-slot='dialog-content'] {
          padding-top: 3rem;
        }

        /* Ensure the animation styles are applied in the dialog */
        .svg-container g path[fill='#018A08'] {
          transform-origin: center;
          animation: pathPulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
        }

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
          animation: pulseSlow 3s ease-in-out infinite;
        }

        @keyframes pulseSlow {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </Dialog>
  );
}
