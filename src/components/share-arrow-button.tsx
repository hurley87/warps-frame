'use client';

import { Button } from './ui/button';
import { Share2 } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';
import { useCallback } from 'react';

interface ShareArrowButtonProps {
  tokenId: number;
}

export function ShareArrowButton({ tokenId }: ShareArrowButtonProps) {
  const handleShareToWarpcast = useCallback(() => {
    const shareText = 'Check out my arrow!';
    const shareUrl = encodeURIComponent(`https://warps.fun/token/${tokenId}`);
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      shareText
    )}&embeds[]=${shareUrl}`;
    sdk.actions.openUrl(warpcastUrl);
  }, [tokenId]);

  return (
    <Button
      onClick={handleShareToWarpcast}
      size="sm"
      variant="ghost"
      className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
    >
      <Share2 className="h-4 w-4" />
      <span>Share</span>
    </Button>
  );
}
