import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { toast } from 'sonner';

const BASE_CHAIN_ID = 8453;

export function useNetworkCheck() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    if (isConnected) {
      const onCorrectNetwork = chainId === BASE_CHAIN_ID;
      setIsCorrectNetwork(onCorrectNetwork);

      if (!onCorrectNetwork) {
        toast.error('Please switch to Base network to use this application');
      }
    }
  }, [chainId, isConnected]);

  const switchToBaseNetwork = async () => {
    if (!isConnected) return;

    if (chainId !== BASE_CHAIN_ID) {
      try {
        await switchChain({ chainId: base.id });
        toast.success('Successfully switched to Base network');
      } catch (error) {
        console.error('Failed to switch network:', error);
        toast.error('Failed to switch to Base network');
      }
    }
  };

  return {
    isCorrectNetwork,
    switchToBaseNetwork,
    isSwitchingNetwork: isPending,
  };
}
