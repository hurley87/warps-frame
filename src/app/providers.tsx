'use client';

import dynamic from 'next/dynamic';

const WagmiProvider = dynamic(
  () => import('@/components/providers/WagmiProvider'),
  {
    ssr: false,
  }
);

const PostHogProvider = dynamic(
  () => import('./posthog').then((mod) => mod.PostHogProvider),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <PostHogProvider>{children}</PostHogProvider>
    </WagmiProvider>
  );
}
