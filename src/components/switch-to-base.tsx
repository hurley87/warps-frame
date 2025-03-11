'use client';

import { useNetworkCheck } from '@/hooks/use-network-check';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { ComponentProps } from 'react';

// Determine which network name to use based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const NETWORK_NAME = isDevelopment ? 'Base Sepolia' : 'Base';

type ButtonProps = ComponentProps<typeof Button>;

interface SwitchNetworkProps extends Omit<ButtonProps, 'onClick'> {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  children?: React.ReactNode;
}

export function SwitchNetwork({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}: SwitchNetworkProps) {
  const { isConnected } = useAccount();
  const { isCorrectNetwork, switchToCorrectNetwork, isSwitchingNetwork } =
    useNetworkCheck();

  // If not connected or already on correct network, don't render the button
  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={switchToCorrectNetwork}
      disabled={isSwitchingNetwork}
      {...props}
    >
      {children ||
        (isSwitchingNetwork
          ? 'Switching...'
          : `Switch to ${NETWORK_NAME} Network`)}
    </Button>
  );
}

// For backward compatibility
export const SwitchToBase = SwitchNetwork;
