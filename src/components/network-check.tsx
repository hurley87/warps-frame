'use client';

import { useNetworkCheck } from '@/hooks/use-network-check';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { AlertCircle } from 'lucide-react';

export function NetworkCheck({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { isCorrectNetwork, switchToBaseNetwork, isSwitchingNetwork } =
    useNetworkCheck();

  if (!isConnected) {
    return <>{children}</>;
  }

  if (!isCorrectNetwork) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-in fade-in-50 slide-in-from-bottom-10 duration-300">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Network Switch Required</h2>
          </div>

          <p className="mb-6 text-muted-foreground">
            Arrows is built on Base. Switch over to Base to continue.
          </p>

          <Button
            onClick={switchToBaseNetwork}
            disabled={isSwitchingNetwork}
            className="w-full"
          >
            {isSwitchingNetwork ? 'Switching...' : 'Switch to Base Network'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
