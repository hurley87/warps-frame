import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { toast } from 'sonner';

// Use Base network exclusively
const targetChain = base;
const TARGET_CHAIN_ID = targetChain.id;
const NETWORK_NAME = 'Base';

export function useNetworkCheck() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    if (isConnected) {
      const onCorrectNetwork = chainId === TARGET_CHAIN_ID;
      setIsCorrectNetwork(onCorrectNetwork);

      if (!onCorrectNetwork) {
        toast.error(
          `Please switch to ${NETWORK_NAME} network to use this application`
        );
      }
    }
  }, [chainId, isConnected]);

  const switchToCorrectNetwork = async () => {
    if (!isConnected) return;

    if (chainId !== TARGET_CHAIN_ID) {
      try {
        await switchChain({ chainId: targetChain.id });
        toast.success(`Successfully switched to ${NETWORK_NAME} network`);
      } catch (error) {
        console.error('Failed to switch network:', error);
        toast.error(`Failed to switch to ${NETWORK_NAME} network`);
      }
    }
  };

  return {
    isCorrectNetwork,
    switchToCorrectNetwork,
    isSwitchingNetwork: isPending,
    // For backward compatibility
    switchToBaseNetwork: switchToCorrectNetwork,
  };
}
