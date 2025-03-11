import { switchChain, getChainId } from '@wagmi/core';
import { base } from 'wagmi/chains';
import { toast } from 'sonner';
import { config } from '@/components/providers/WagmiProvider';

const BASE_CHAIN_ID = 8453;

/**
 * Checks if the current network is Base and switches to it if not
 * @returns A promise that resolves to true if the network is Base or was successfully switched to Base
 */
export async function ensureBaseNetwork(): Promise<boolean> {
  try {
    const chainId = await getChainId(config);

    if (chainId !== BASE_CHAIN_ID) {
      toast.info('Switching to Base network...');
      await switchChain(config, { chainId: base.id });
      toast.success('Successfully switched to Base network');
      return true;
    }

    return true; // Already on Base network
  } catch (error) {
    console.error('Failed to switch to Base network:', error);
    toast.error('Failed to switch to Base network. Please switch manually.');
    return false;
  }
}

/**
 * Checks if the current network is Base
 * @returns A promise that resolves to true if the current network is Base
 */
export async function isBaseNetwork(): Promise<boolean> {
  try {
    const chainId = await getChainId(config);
    return chainId === BASE_CHAIN_ID;
  } catch (error) {
    console.error('Failed to check network:', error);
    return false;
  }
}
