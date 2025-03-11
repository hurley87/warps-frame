'use client';

import dynamic from 'next/dynamic';

const WagmiProvider = dynamic(
  () => import('@/components/providers/WagmiProvider'),
  {
    ssr: false,
  }
);

const NetworkCheck = dynamic(
  () => import('@/components/network-check').then((mod) => mod.NetworkCheck),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <NetworkCheck>{children}</NetworkCheck>
    </WagmiProvider>
  );
}
