'use client';

import { TokenDetailsDialog } from '@/components/token-details-dialog';
import { useTokensMetadata } from '@/hooks/use-tokens';
import { type Address } from 'viem';
import { useAccount } from 'wagmi';

interface TokenPageClientProps {
  params: {
    tokenId: string;
  };
}

export default function TokenPageClient({ params }: TokenPageClientProps) {
  const { address, isConnecting } = useAccount();
  const { tokenId } = params;
  const parsedTokenId = parseInt(tokenId, 10);

  // Fetch token metadata using the hook
  const {
    data: tokens,
    isLoading,
    error,
  } = useTokensMetadata(address as Address, [parsedTokenId.toString()]);

  const token = tokens?.[0];

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Please connect your wallet</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (error) {
    const errorMessage = error.message.includes('ERC721__InvalidToken')
      ? `Token #${parsedTokenId} does not exist or has been burned`
      : `Error loading token: ${error.message}`;

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-white text-lg mb-4">{errorMessage}</p>
          <p className="text-white/60 text-sm">
            Please check if the token ID is correct and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Token not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TokenDetailsDialog
        token={token}
        open={true}
        onOpenChange={() => {
          // Handle dialog close if needed
        }}
        hideTokenPageLink={true}
      />
    </div>
  );
}
