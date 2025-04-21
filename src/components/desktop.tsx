import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import DesktopGame from './desktop-game';
import { chain } from '@/lib/chain';

const config = getDefaultConfig({
  appName: 'Warps',
  projectId: 'YOUR_PROJECT_ID',
  chains: [chain],
  ssr: true,
});

export function Desktop() {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={chain}>
          <DesktopGame />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
