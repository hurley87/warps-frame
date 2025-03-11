'use client';

import { useNetworkCheck } from '@/hooks/use-network-check';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { ComponentProps } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

interface SwitchToBaseProps extends Omit<ButtonProps, 'onClick'> {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  children?: React.ReactNode;
}

export function SwitchToBase({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}: SwitchToBaseProps) {
  const { isConnected } = useAccount();
  const { isCorrectNetwork, switchToBaseNetwork, isSwitchingNetwork } =
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
      onClick={switchToBaseNetwork}
      disabled={isSwitchingNetwork}
      {...props}
    >
      {children ||
        (isSwitchingNetwork ? 'Switching...' : 'Switch to Base Network')}
    </Button>
  );
}
