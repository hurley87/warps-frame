import { createConfig, WagmiProvider } from 'wagmi';
import { DaimoPayProvider, getDefaultConfig } from '@daimo/pay';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { farcasterConnector } from './farcaster';
import { chain, transport } from '@/lib/chain';

export const config = createConfig(
  getDefaultConfig({
    appName: 'Warps',
    chains: [chain],
    transports: transport,
    connectors: [farcasterConnector()],
  })
);

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider>{children}</DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
