'use client';

import { useAccount } from 'wagmi';
import { useTokens } from '@/hooks/use-tokens';

export function Tokens() {
  const { address, isConnected } = useAccount();
  const { data: tokens, isLoading, isFetching } = useTokens(address);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          Connect your wallet to view your arrows
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative aspect-square">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg" />
            <img
              src="/loadingarrow.svg"
              alt="Loading"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative p-4">
      {isFetching && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10">
          <div className="text-sm text-muted-foreground p-2 text-center">
            Loading your arrows...
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-4">
        {tokens?.map((token) => (
          <div
            key={`token-${token.id}`}
            className="relative aspect-square group"
          >
            <div
              className="w-full h-full transition-transform duration-300 hover:scale-110 animate-pulse-subtle relative"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(1, 138, 8, 0.5))',
              }}
              dangerouslySetInnerHTML={{
                __html: token.image?.startsWith('data:image/svg+xml;base64,')
                  ? atob(token.image.split(',')[1])
                  : '',
              }}
            />
            <div
              className="absolute inset-0 bg-[#018A08] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"
              style={{
                filter: 'blur(15px)',
              }}
            />
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes pulseSlow {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-pulse-subtle {
          animation: pulseSlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
