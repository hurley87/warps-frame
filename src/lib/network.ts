import { switchChain, getChainId } from '@wagmi/core';
import { base, baseSepolia } from 'wagmi/chains';
import { toast } from 'sonner';
import { config } from '@/components/providers/WagmiProvider';

// Determine which chain to use based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const targetChain = isDevelopment ? baseSepolia : base;
const TARGET_CHAIN_ID = targetChain.id;
const NETWORK_NAME = isDevelopment ? 'Base Sepolia' : 'Base';

/**
 * Checks if the current network is the target network and switches to it if not
 * @returns A promise that resolves to true if the network is correct or was successfully switched
 */
export async function ensureCorrectNetwork(): Promise<boolean> {
  try {
    const chainId = await getChainId(config);

    if (chainId !== TARGET_CHAIN_ID) {
      toast.info(`Switching to ${NETWORK_NAME} network...`);
      await switchChain(config, { chainId: targetChain.id });
      toast.success(`Successfully switched to ${NETWORK_NAME} network`);
      return true;
    }

    return true; // Already on correct network
  } catch (error) {
    console.error(`Failed to switch to ${NETWORK_NAME} network:`, error);
    toast.error(
      `Failed to switch to ${NETWORK_NAME} network. Please switch manually.`
    );
    return false;
  }
}

/**
 * Checks if the current network is the target network
 * @returns A promise that resolves to true if the current network is correct
 */
export async function isCorrectNetwork(): Promise<boolean> {
  try {
    const chainId = await getChainId(config);
    return chainId === TARGET_CHAIN_ID;
  } catch (error) {
    console.error('Failed to check network:', error);
    return false;
  }
}

// For backward compatibility
export const ensureBaseNetwork = ensureCorrectNetwork;
export const isBaseNetwork = isCorrectNetwork;
