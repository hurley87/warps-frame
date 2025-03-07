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
            <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/20 to-primary/0 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {isFetching && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10">
          <div className="text-sm text-muted-foreground p-2">
            Loading new arrows...
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {tokens?.map((token) => (
          <div key={`token-${token.id}`} className="relative aspect-square">
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{
                __html: token.image?.startsWith('data:image/svg+xml;base64,')
                  ? atob(token.image.split(',')[1])
                  : '',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
